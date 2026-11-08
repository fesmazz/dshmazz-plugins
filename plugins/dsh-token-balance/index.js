/**
 * Host half of the Token & Balance plugin.
 *
 * Serves one same-origin JSON route the Client half polls:
 *
 *   GET /dsh-token-balance
 *
 * `balance` is read from the signed-in DeepSeek account wallet when one is
 * available (`ctx.deepseekAccount.getBalance`), otherwise from the DeepSeek
 * API `GET /user/balance` using the API key stored through the credentials
 * service (DEEPSEEK_API_KEY) or the launching process environment.
 *
 * `window` is a clock-aligned, 24-hour usage report: per hourly bucket and per
 * model, the provider-reported token counts, request count, and an estimated
 * cost from the editable rate table (`rates.json`). Events come from
 * `ctx.sessionQuery` (live and persisted sessions); when that service is not
 * mounted the plugin falls back to the live sessions' committed events. Only
 * sessions that are live or were created inside the window are read, so an
 * archived session older than the window is not scanned.
 *
 * No credential ever crosses the wire: only amounts, token counts and model ids.
 */

import fs from 'node:fs'

import { normalizeAccountBalance, normalizeApiKeyBalance } from './src/balance.js'
import { DEFAULT_RATES, costOfUsage, normalizeRates } from './src/pricing.js'
import { hourlyBuckets, sessionBreakdown, sessionHints, sumUsageRecords, usageRecords } from './src/usage.js'

/** Cordis plugin name. */
export const name = 'token-balance'

/** The HTTP carrier is the only required service. */
export const inject = ['webServer']

const BALANCE_URL = 'https://api.deepseek.com/user/balance'
const BALANCE_CACHE_MS = 30_000
const BALANCE_TIMEOUT_MS = 8_000
const API_KEY_REF = 'DEEPSEEK_API_KEY'
const REPORT_CACHE_MS = 30_000
const REPORT_CACHE_LIMIT = 16
const HOUR_MS = 3_600_000
const HALF_HOUR_MS = 1_800_000
const RANGE_HOURS = [6, 12, 24, 48]
const DEFAULT_RANGE_HOURS = 24
const SESSION_CACHE_LIMIT = 600
const READ_CONCURRENCY = 4

/** Client identity the account service expects; the bundled runtime version is enough. */
const ACCOUNT_CLIENT = { version: '0.2.1-rc.5', locale: 'en', timezoneOffsetSeconds: 0 }

/** The rate table: plugin config override, then `rates.json`, then built-in defaults. */
function loadRates(config) {
  if (config !== null && typeof config === 'object' && config.rates !== null && typeof config.rates === 'object') {
    return normalizeRates(config.rates, 'config')
  }
  try {
    const raw = fs.readFileSync(new URL('./rates.json', import.meta.url), 'utf8')
    return normalizeRates(JSON.parse(raw), 'rates.json')
  } catch {
    return normalizeRates(DEFAULT_RATES, 'defaults')
  }
}

/** Optional service lookup that never throws for an absent service. */
function service(ctx, name) {
  try {
    return ctx.get(name)
  } catch {
    return undefined
  }
}

function liveSessions(ctx) {
  const sessions = service(ctx, 'sessions')
  try {
    return sessions !== undefined && typeof sessions.list === 'function' ? sessions.list() : []
  } catch {
    return []
  }
}

function liveSession(ctx, sessionId) {
  const sessions = service(ctx, 'sessions')
  try {
    return sessions !== undefined && typeof sessions.get === 'function' ? sessions.get(sessionId) : undefined
  } catch {
    return undefined
  }
}

function sessionIdOf(session) {
  const id = session?.id ?? session?.header?.id
  return typeof id === 'string' ? id : undefined
}

/** The current log length of a live session, or undefined when it cannot be read. */
function liveSeqOf(session) {
  try {
    const seq = session?.seq
    return typeof seq === 'number' && Number.isFinite(seq) ? seq : undefined
  } catch {
    return undefined
  }
}

/** Signed-in DeepSeek account wallet balance, when an account grant is present. */
async function accountBalance(ctx) {
  try {
    const account = service(ctx, 'deepseekAccount')
    if (account === undefined || typeof account.getBalance !== 'function') return undefined
    return normalizeAccountBalance(await account.getBalance(ACCOUNT_CLIENT))
  } catch {
    return undefined
  }
}

/** The stored DeepSeek API key, or undefined when none is configured. */
async function apiKeyOf(ctx) {
  try {
    const credentials = service(ctx, 'credentials')
    if (credentials !== undefined && typeof credentials.resolve === 'function') {
      const hit = await credentials.resolve(API_KEY_REF)
      if (hit !== undefined && typeof hit.value === 'string' && hit.value.length > 0) return hit.value
    }
  } catch {
    // Fall through to the ambient environment.
  }
  const ambient = process.env[API_KEY_REF]
  return typeof ambient === 'string' && ambient.length > 0 ? ambient : undefined
}

/** API-key balance from the official DeepSeek balance endpoint. */
async function apiKeyBalance(ctx) {
  const apiKey = await apiKeyOf(ctx)
  if (apiKey === undefined) return { configured: false }
  try {
    const response = await fetch(BALANCE_URL, {
      headers: { authorization: `Bearer ${apiKey}`, accept: 'application/json' },
      signal: AbortSignal.timeout(BALANCE_TIMEOUT_MS),
    })
    if (!response.ok) return { configured: true, source: 'api-key', error: `HTTP ${String(response.status)}` }
    return normalizeApiKeyBalance(await response.json())
  } catch (error) {
    return { configured: true, source: 'api-key', error: error instanceof Error ? error.message : String(error) }
  }
}

function writeJson(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(JSON.stringify(body))
}

/** Split a list into chunks, for bounded-concurrency session reads. */
function chunks(list, size) {
  const result = []
  for (let index = 0; index < list.length; index += size) result.push(list.slice(index, index + size))
  return result
}

export function apply(ctx, config = {}) {
  const rates = loadRates(config)
  const cache = {
    balance: { at: 0, value: undefined, ready: false },
    reports: new Map(),
    sessions: new Map(),
  }

  /** Fetch and normalize the balance; cached briefly. */
  async function readBalance() {
    const now = Date.now()
    if (cache.balance.ready && now - cache.balance.at < BALANCE_CACHE_MS) return cache.balance.value
    const account = await accountBalance(ctx)
    const value = account ?? (await apiKeyBalance(ctx))
    cache.balance = { at: now, value, ready: true }
    return value
  }

  /**
   * One session's usage records, read once for persisted sessions and re-read
   * only when a live session's log grows.
   */
  async function sessionUsage(query, candidate, windowStart) {
    const cached = cache.sessions.get(candidate.id)
    // A cached read only covers requests inside the window it was read for;
    // a longer range re-reads that session once to pick up older events.
    const covers = cached !== undefined && cached.from <= windowStart
    if (covers) {
      if (!candidate.live && cached.complete) return cached.usage
      if (candidate.live) {
        const seq = liveSeqOf(liveSession(ctx, candidate.id) ?? candidate.session)
        if (cached.complete === false && seq !== undefined && cached.seq === seq) return cached.usage
      }
    }
    const seqBefore = liveSeqOf(liveSession(ctx, candidate.id) ?? candidate.session)
    let events
    if (query !== undefined && typeof query.readSession === 'function') {
      const result = await query.readSession(candidate.id)
      events = Array.isArray(result?.events) ? result.events : []
    } else {
      const session = liveSession(ctx, candidate.id) ?? candidate.session
      events = typeof session?.snapshotEvents === 'function' ? session.snapshotEvents() : []
    }
    const usage = usageRecords(events, { from: windowStart })
    const seqAfter = liveSeqOf(liveSession(ctx, candidate.id) ?? candidate.session)
    // Cache the log length only when it did not move during the read; otherwise
    // the next poll re-reads rather than trusting a snapshot with a missing tail.
    const stableSeq = seqBefore !== undefined && seqBefore === seqAfter ? seqAfter : undefined
    const hints = sessionHints(events, candidate.header?.cwd)
    cache.sessions.set(candidate.id, { seq: stableSeq, complete: !candidate.live, from: windowStart, usage, project: hints.project, title: hints.title })
    return usage
  }

  /** Candidate sessions: live ones, plus persisted ones created inside the window. */
  async function candidates(query, windowStart) {
    if (query !== undefined && typeof query.listSessions === 'function') {
      try {
        const records = await query.listSessions()
        const list = []
        for (const record of Array.isArray(records) ? records : []) {
          const id = record?.header?.id
          if (typeof id !== 'string') continue
          const createdAt = typeof record.header.createdAt === 'number' ? record.header.createdAt : 0
          const live = record.live === true
          if (!live && createdAt < windowStart) continue
          list.push({ id, live, createdAt, header: record.header })
        }
        return list
      } catch {
        // The persistence backend failed; fall back to the live sessions below.
      }
    }
    return liveSessions(ctx)
      .map((session) => ({
        id: sessionIdOf(session),
        live: true,
        session,
        header: session.header,
      }))
      .filter((candidate) => typeof candidate.id === 'string')
  }

  function prune(windowStart) {
    if (cache.sessions.size <= SESSION_CACHE_LIMIT) return
    for (const [id, entry] of cache.sessions) {
      const newest = entry.usage.reduce((max, record) => Math.max(max, record.time), 0)
      if (entry.complete && newest < windowStart) cache.sessions.delete(id)
      if (cache.sessions.size <= SESSION_CACHE_LIMIT) return
    }
  }

  async function buildReport(now, hours, sessionId) {
    const bucketMs = hours === 6 || hours === 12 ? HALF_HOUR_MS : hours === 48 ? 2 * HOUR_MS : HOUR_MS
    const end = Math.floor(now / bucketMs) * bucketMs + bucketMs
    const windowStart = end - hours * HOUR_MS
    const query = service(ctx, 'sessionQuery')
    const list = await candidates(query, windowStart)
    for (const group of chunks(list, READ_CONCURRENCY)) {
      await Promise.all(
        group.map(async (candidate) => {
          try {
            await sessionUsage(query, candidate, windowStart)
          } catch {
            // One unreadable session must not blank the whole report.
          }
        }),
      )
    }
    const records = []
    for (const [id, entry] of cache.sessions) {
      for (const record of entry.usage) if (record.time >= windowStart) records.push({ ...record, sessionId: id })
    }
    const costOf = (record) => costOfUsage(rates, record.model, record.time, record)
    const metaById = new Map(list.map((candidate) => {
      const cached = cache.sessions.get(candidate.id)
      return [candidate.id, { header: candidate.header, project: cached?.project, title: cached?.title }]
    }))
    if (query !== undefined && typeof query.readTitleSnapshots === 'function' && list.length > 0) {
      try {
        const titles = await query.readTitleSnapshots(list.map((candidate) => candidate.id))
        for (const result of Array.isArray(titles) ? titles : []) {
          if (result?.status === 'fulfilled' && typeof result.value?.title?.title === 'string') {
            const meta = metaById.get(result.sessionId)
            if (meta !== undefined) meta.title = result.value.title.title
          }
        }
      } catch {
        // Titles are cosmetic; the breakdown still works with ids.
      }
    }
    const breakdown = sessionBreakdown(records, metaById, costOf)
    const window = hourlyBuckets(records, { now, hours, bucketMs, costOf })
    const session =
      sessionId === undefined
        ? null
        : sumUsageRecords(
            records.filter((record) => record.sessionId === sessionId && record.time >= windowStart && record.time < end),
            { costOf },
          )
    // Keep a stable legend/stack order for the shipped models; unknown models follow by size.
    const preferred = ['deepseek-v4-pro', 'deepseek-flash']
    window.models.sort((a, b) => {
      const rankA = preferred.indexOf(a.id)
      const rankB = preferred.indexOf(b.id)
      if (rankA !== -1 || rankB !== -1) return (rankA === -1 ? preferred.length : rankA) - (rankB === -1 ? preferred.length : rankB)
      return b.totalTokens - a.totalTokens
    })
    prune(windowStart)
    return {
      rates: {
        currency: rates.currency,
        unit: rates.unit,
        source: rates.source,
        docs: rates.docs,
        fetched: rates.fetched,
      },
      window,
      session,
      breakdown,
      meta: { sessionSource: query === undefined ? 'live' : 'sessionQuery', sessions: list.length },
      updatedAt: now,
    }
  }

  /** One report per requested range/session; cached briefly and coalesced per key. */
  function readReport(hours, sessionId) {
    const key = hours + '|' + (sessionId === undefined ? '' : sessionId)
    const now = Date.now()
    const cached = cache.reports.get(key)
    if (cached !== undefined && cached.value !== undefined && now - cached.at < REPORT_CACHE_MS) return Promise.resolve(cached.value)
    if (cached !== undefined && cached.pending !== undefined) return cached.pending
    const pending = buildReport(now, hours, sessionId)
      .then((value) => {
        cache.reports.set(key, { at: Date.now(), value, pending: undefined })
        return value
      })
      .catch((error) => {
        cache.reports.delete(key)
        throw error
      })
    cache.reports.set(key, { at: 0, value: undefined, pending })
    if (cache.reports.size > REPORT_CACHE_LIMIT) {
      for (const oldest of cache.reports.keys()) {
        if (cache.reports.size <= REPORT_CACHE_LIMIT) break
        if (oldest !== key) cache.reports.delete(oldest)
      }
    }
    return pending
  }

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: '/dsh-token-balance',
        handler: async (req, res) => {
          const url = new URL(typeof req.url === 'string' ? req.url : '/dsh-token-balance', 'http://localhost')
          const requestedHours = Number(url.searchParams.get('hours'))
          const hours = RANGE_HOURS.includes(requestedHours) ? requestedHours : DEFAULT_RANGE_HOURS
          const rawSessionId = url.searchParams.get('sessionId')
          const sessionId = rawSessionId !== null && rawSessionId.length > 0 ? rawSessionId : undefined
          const [balanceResult, reportResult] = await Promise.allSettled([readBalance(), readReport(hours, sessionId)])
          const errorOf = (result) => (result.reason instanceof Error ? result.reason.message : String(result.reason))
          if (balanceResult.status === 'rejected' && reportResult.status === 'rejected') {
            writeJson(res, 500, { error: errorOf(reportResult) })
            return
          }
          const body = {
            balance: balanceResult.status === 'fulfilled' ? balanceResult.value ?? null : null,
            updatedAt: Date.now(),
          }
          if (reportResult.status === 'fulfilled') {
            Object.assign(body, reportResult.value)
          } else {
            body.window = null
            body.rates = null
            body.meta = { sessionSource: 'unavailable', sessions: 0 }
            body.error = errorOf(reportResult)
          }
          writeJson(res, 200, body)
        },
      }),
    'token-balance: route',
  )
}
