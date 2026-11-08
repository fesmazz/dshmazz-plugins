/**
 * Host half of the Token & Balance plugin.
 *
 * Serves one same-origin JSON route the Client half polls:
 *
 *   GET /dsh-token-balance?sessionId=<id>
 *
 * `balance` is read from the signed-in DeepSeek account wallet when one is
 * available (`ctx.deepseekAccount.getBalance`), otherwise from the DeepSeek
 * API `GET /user/balance` using the API key stored through the credentials
 * service (DEEPSEEK_API_KEY) or the launching process environment.
 *
 * `sessionUsage` / `globalUsage` sum provider-reported token usage from the
 * committed `assistant/message` events of the live Sessions.
 *
 * No credential ever crosses the wire: only amounts and token counts do.
 */

import { normalizeAccountBalance, normalizeApiKeyBalance } from './src/balance.js'
import { emptyUsage, sumUsage } from './src/usage.js'

/** Cordis plugin name. */
export const name = 'token-balance'

/** The HTTP carrier is the only required service. */
export const inject = ['webServer']

const BALANCE_URL = 'https://api.deepseek.com/user/balance'
const BALANCE_CACHE_MS = 30_000
const BALANCE_TIMEOUT_MS = 8_000
const API_KEY_REF = 'DEEPSEEK_API_KEY'

/** Client identity the account service expects; the bundled runtime version is enough. */
const ACCOUNT_CLIENT = { version: '0.2.1-rc.5', locale: 'en', timezoneOffsetSeconds: 0 }

/** @type {{ at: number, value: unknown } | undefined} */
let balanceCache

/** The live Session store, when this composition provides it. */
function liveSessions(ctx) {
  try {
    const sessions = ctx.get('sessions')
    return sessions !== undefined && typeof sessions.list === 'function' ? sessions.list() : []
  } catch {
    return []
  }
}

function sessionIdOf(session) {
  const id = session.id ?? session.header?.id
  return typeof id === 'string' ? id : undefined
}

/** Committed events of a live Session, or an empty list when unreadable. */
function eventsOf(session) {
  try {
    return typeof session.snapshotEvents === 'function' ? session.snapshotEvents() : []
  } catch {
    return []
  }
}

function sessionUsage(ctx, sessionId) {
  for (const session of liveSessions(ctx)) {
    if (sessionIdOf(session) !== sessionId) continue
    return sumUsage(eventsOf(session))
  }
  return undefined
}

function globalUsage(ctx) {
  const total = emptyUsage()
  for (const session of liveSessions(ctx)) {
    const usage = sumUsage(eventsOf(session))
    total.inputTokens += usage.inputTokens
    total.outputTokens += usage.outputTokens
    total.cacheReadTokens += usage.cacheReadTokens
    total.cacheWriteTokens += usage.cacheWriteTokens
    total.totalTokens += usage.totalTokens
    total.requests += usage.requests
  }
  return total
}

/** Signed-in DeepSeek account wallet balance, when an account grant is present. */
async function accountBalance(ctx) {
  try {
    const account = ctx.get('deepseekAccount')
    if (account === undefined || typeof account.getBalance !== 'function') return undefined
    return normalizeAccountBalance(await account.getBalance(ACCOUNT_CLIENT))
  } catch {
    return undefined
  }
}

/** The stored DeepSeek API key, or undefined when none is configured. */
async function apiKeyOf(ctx) {
  try {
    const credentials = ctx.get('credentials')
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

/** Fetch and normalize the balance; cached briefly. */
async function readBalance(ctx) {
  const now = Date.now()
  if (balanceCache !== undefined && now - balanceCache.at < BALANCE_CACHE_MS) return balanceCache.value
  const account = await accountBalance(ctx)
  const value = account ?? (await apiKeyBalance(ctx))
  balanceCache = { at: now, value }
  return value
}

function writeJson(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(JSON.stringify(body))
}

export function apply(ctx) {
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: '/dsh-token-balance',
        handler: async (req, res) => {
          try {
            const url = new URL(req.url ?? '/', 'http://local')
            const sessionId = url.searchParams.get('sessionId') ?? undefined
            const balance = await readBalance(ctx)
            let session
            try {
              session = sessionId === undefined ? undefined : sessionUsage(ctx, sessionId)
            } catch {
              session = undefined
            }
            let global
            try {
              global = globalUsage(ctx)
            } catch {
              global = undefined
            }
            writeJson(res, 200, {
              balance,
              sessionUsage: session ?? null,
              globalUsage: global ?? null,
              updatedAt: Date.now(),
            })
          } catch (error) {
            writeJson(res, 500, { error: error instanceof Error ? error.message : String(error) })
          }
        },
      }),
    'token-balance: route',
  )
}
