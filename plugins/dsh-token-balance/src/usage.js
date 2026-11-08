/**
 * Pure folding of provider-reported token usage from Session events.
 *
 * The Harness records `assistant/message` events whose `data.usage` carries
 * `inputTokens`, `outputTokens`, `cacheReadTokens`, `cacheWriteTokens` and
 * `totalTokens`. `inputTokens` counts cache-miss prompt tokens only;
 * `cacheReadTokens` is the cache-hit prompt side (so the harness-exposed total
 * is input + output + cacheRead + cacheWrite). Older adapters use snake_case or
 * prompt/completion spellings, so every count resolves through an ordered list
 * of aliases.
 *
 * `sumUsage` keeps the v1.0 all-time fold. `usageRecords` + `hourlyBuckets`
 * back the 24-hour report: clock-aligned hourly buckets ending at the current
 * hour, per model, with an optional cost callback.
 *
 * @module usage
 */

/** A zeroed usage total. */
export function emptyUsage() {
  return { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, totalTokens: 0, requests: 0 }
}

/** Resolve a numeric usage field from its possible spellings. */
function count(usage, names) {
  for (const name of names) {
    const value = usage[name]
    if (typeof value === 'number' && Number.isFinite(value)) return value
  }
  return undefined
}

/** The ordered spellings for each counter. */
const INPUT = ['inputTokens', 'promptTokens', 'prompt_tokens']
const OUTPUT = ['outputTokens', 'completionTokens', 'completion_tokens']
const CACHE_READ = ['cacheReadTokens', 'cachedInputTokens', 'cache_read_tokens']
const CACHE_WRITE = ['cacheWriteTokens', 'cache_write_tokens']
const TOTAL = ['totalTokens', 'total_tokens']

function usageOfEvent(event) {
  if (event === null || typeof event !== 'object' || event.type !== 'assistant/message') return undefined
  const usage = event.data === null || typeof event.data !== 'object' ? undefined : event.data.usage
  if (usage === null || typeof usage !== 'object') return undefined
  const source = event.data.message?.source
  const model = source !== null && typeof source === 'object' && typeof source.model === 'string' ? source.model : 'unknown'
  const inputTokens = count(usage, INPUT) ?? 0
  const outputTokens = count(usage, OUTPUT) ?? 0
  const cacheReadTokens = count(usage, CACHE_READ) ?? 0
  const cacheWriteTokens = count(usage, CACHE_WRITE) ?? 0
  const combined = count(usage, TOTAL)
  return {
    time: typeof event.time === 'number' && Number.isFinite(event.time) ? event.time : undefined,
    model,
    inputTokens,
    outputTokens,
    cacheReadTokens,
    cacheWriteTokens,
    totalTokens: combined === undefined ? inputTokens + outputTokens + cacheReadTokens + cacheWriteTokens : combined,
  }
}

/**
 * Sum provider-reported token usage from one event list.
 * @param events - committed Session events.
 * @returns totals across every readable `assistant/message` usage record.
 */
export function sumUsage(events) {
  const total = emptyUsage()
  for (const event of events) {
    const record = usageOfEvent(event)
    if (record === undefined) continue
    total.inputTokens += record.inputTokens
    total.outputTokens += record.outputTokens
    total.cacheReadTokens += record.cacheReadTokens
    total.cacheWriteTokens += record.cacheWriteTokens
    total.totalTokens += record.totalTokens
    total.requests += 1
  }
  return total
}

/**
 * Project events into usage records, optionally restricted to a time window.
 * @param events - committed Session events.
 * @param options - inclusive `from` and exclusive `to` epoch-millisecond bounds.
 * @returns one record per readable `assistant/message` usage entry.
 */
export function usageRecords(events, options = {}) {
  const from = options.from ?? -Infinity
  const to = options.to ?? Infinity
  const records = []
  for (const event of events) {
    const record = usageOfEvent(event)
    if (record === undefined || record.time === undefined) continue
    if (record.time < from || record.time >= to) continue
    records.push(record)
  }
  return records
}

function addRecord(bucket, record, cost) {
  const current = bucket.models[record.model]
  const target =
    current ??
    (bucket.models[record.model] = {
      inputTokens: 0,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      totalTokens: 0,
      requests: 0,
      cost: 0,
    })
  target.inputTokens += record.inputTokens
  target.outputTokens += record.outputTokens
  target.cacheReadTokens += record.cacheReadTokens
  target.cacheWriteTokens += record.cacheWriteTokens
  target.totalTokens += record.totalTokens
  target.requests += 1
  target.cost += Number.isFinite(cost) ? cost : 0
}

/**
 * Fold usage records into clock-aligned hourly buckets ending at the current
 * hour. The last bucket is the current, partial hour.
 * @param records - usage records from {@link usageRecords}.
 * @param options - `now` (default Date.now), `hours` (default 24), `costOf` (record → cost).
 * @returns buckets, per-model totals, and grand totals.
 */
export function hourlyBuckets(records, options = {}) {
  const now = typeof options.now === 'number' && Number.isFinite(options.now) ? options.now : Date.now()
  const durationHours = Number.isInteger(options.hours) && options.hours > 0 ? options.hours : 24
  const bucketMs = Number.isInteger(options.bucketMs) && options.bucketMs > 0 ? options.bucketMs : 3_600_000
  const bucketCount = Math.max(1, Math.round((durationHours * 3_600_000) / bucketMs))
  const costOf = typeof options.costOf === 'function' ? options.costOf : () => 0
  const end = Math.floor(now / bucketMs) * bucketMs + bucketMs
  const start = end - durationHours * 3_600_000
  const buckets = Array.from({ length: bucketCount }, (_, index) => ({
    start: start + index * bucketMs,
    end: start + (index + 1) * bucketMs,
    models: {},
  }))
  for (const record of records) {
    if (typeof record.time !== 'number' || record.time < start || record.time >= end) continue
    const index = Math.min(bucketCount - 1, Math.floor((record.time - start) / bucketMs))
    addRecord(buckets[index], record, costOf(record))
  }
  const byModel = new Map()
  for (const bucket of buckets) {
    for (const [id, entry] of Object.entries(bucket.models)) {
      const total = byModel.get(id) ?? {
        id,
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        totalTokens: 0,
        requests: 0,
        cost: 0,
      }
      total.inputTokens += entry.inputTokens
      total.outputTokens += entry.outputTokens
      total.cacheReadTokens += entry.cacheReadTokens
      total.cacheWriteTokens += entry.cacheWriteTokens
      total.totalTokens += entry.totalTokens
      total.requests += entry.requests
      total.cost += entry.cost
      byModel.set(id, total)
    }
  }
  const models = [...byModel.values()].sort((a, b) => b.totalTokens - a.totalTokens || a.id.localeCompare(b.id))
  const totals = models.reduce(
    (sum, model) => ({
      inputTokens: sum.inputTokens + model.inputTokens,
      outputTokens: sum.outputTokens + model.outputTokens,
      cacheReadTokens: sum.cacheReadTokens + model.cacheReadTokens,
      cacheWriteTokens: sum.cacheWriteTokens + model.cacheWriteTokens,
      totalTokens: sum.totalTokens + model.totalTokens,
      requests: sum.requests + model.requests,
      cost: sum.cost + model.cost,
    }),
    { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, totalTokens: 0, requests: 0, cost: 0 },
  )
  return { start, end, bucketMs, hours: durationHours, bucketCount, buckets, models, totals }
}

/**
 * Sum a flat usage-record list (optionally already filtered to one session).
 * @param records - usage records from {@link usageRecords}.
 * @param options - optional `costOf` (record → cost).
 * @returns the same totals shape as {@link hourlyBuckets}.
 */
export function sumUsageRecords(records, options = {}) {
  const costOf = typeof options.costOf === 'function' ? options.costOf : () => 0
  const totals = {
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    totalTokens: 0,
    requests: 0,
    cost: 0,
  }
  for (const record of records) {
    if (record === null || typeof record !== 'object') continue
    totals.inputTokens += Number.isFinite(record.inputTokens) ? record.inputTokens : 0
    totals.outputTokens += Number.isFinite(record.outputTokens) ? record.outputTokens : 0
    totals.cacheReadTokens += Number.isFinite(record.cacheReadTokens) ? record.cacheReadTokens : 0
    totals.cacheWriteTokens += Number.isFinite(record.cacheWriteTokens) ? record.cacheWriteTokens : 0
    totals.totalTokens += Number.isFinite(record.totalTokens) ? record.totalTokens : 0
    totals.requests += Number.isFinite(record.requests) ? record.requests : 1
    const cost = costOf(record)
    totals.cost += Number.isFinite(cost) ? cost : 0
  }
  return totals
}

/** Allowed Y-axis cost ranges, smallest first. */
export const AXIS_RANGES = Object.freeze([0.5, 1, 1.5, 2, 5, 10, 20, 50, 100])

/**
 * Pick the smallest allowed Y-axis range that fits the data.
 * @param values - bucket cost values.
 * @returns the chosen range, never below 0.5.
 */
export function pickAxisMax(values) {
  let max = 0
  for (const value of values) if (Number.isFinite(value) && value > max) max = value
  return AXIS_RANGES.find((range) => range >= max) ?? AXIS_RANGES[AXIS_RANGES.length - 1]
}

/**
 * Project label for one session header.
 * @param header - session header with `workspace`, `cwd` or `project`.
 * @returns the last path segment, or `Unknown project`.
 */
export function projectOf(header) {
  const raw = header?.cwd ?? header?.workspace ?? header?.project
  if (typeof raw !== 'string' || raw.length === 0) return 'Unknown project'
  const parts = raw.split(/[\\/]/).filter((part) => part.length > 0)
  return parts.length === 0 ? raw : parts[parts.length - 1]
}

/**
 * Group usage records by project and by session.
 * @param records - usage records with `sessionId`.
 * @param metaById - Map of session id to `{ header }`.
 * @param costOf - record → cost.
 * @returns `{ projects, sessions }`, both sorted by cost descending.
 */
export function sessionBreakdown(records, metaById, costOf = () => 0) {
  const sessions = new Map()
  for (const record of records) {
    if (record === null || typeof record !== 'object') continue
    const id = typeof record.sessionId === 'string' ? record.sessionId : 'unknown'
    const meta = metaById instanceof Map ? metaById.get(id) : undefined
    const header = meta?.header
    const project = typeof meta?.project === 'string' && meta.project.length > 0 ? meta.project : projectOf(header)
    const title = typeof meta?.title === 'string' && meta.title.length > 0
      ? meta.title
      : header?.origin === 'subagent'
        ? 'sub-agent - ' + project + ' - ' + (typeof header?.agentPreset === 'string' ? header.agentPreset : 'task')
        : id
    const entry = sessions.get(id) ?? { id, title, project, cost: 0, totalTokens: 0, requests: 0 }
    entry.cost += Number.isFinite(costOf(record)) ? costOf(record) : 0
    entry.totalTokens += Number.isFinite(record.totalTokens) ? record.totalTokens : 0
    entry.requests += Number.isFinite(record.requests) ? record.requests : 1
    sessions.set(id, entry)
  }
  const projects = new Map()
  for (const session of sessions.values()) {
    const project = projects.get(session.project) ?? { name: session.project, cost: 0, totalTokens: 0, requests: 0, sessions: [] }
    project.cost += session.cost
    project.totalTokens += session.totalTokens
    project.requests += session.requests
    project.sessions.push(session)
    projects.set(session.project, project)
  }
  const sortedSessions = [...sessions.values()].sort((a, b) => b.cost - a.cost || a.id.localeCompare(b.id))
  for (const project of projects.values()) project.sessions.sort((a, b) => b.cost - a.cost || a.id.localeCompare(b.id))
  return {
    projects: [...projects.values()].sort((a, b) => b.cost - a.cost || a.name.localeCompare(b.name)),
    sessions: sortedSessions,
  }
}


/**
 * Infer a session's project folder and GUI title from its events.
 *
 * Project: the most frequent immediate subfolder of the session's recorded
 * `cwd` (e.g. `~/Projects/dshmazz-plugins` → `dshmazz-plugins`) seen in tool
 * arguments; falls back to the cwd basename. Title: the latest `session/title`
 * or title-bearing event.
 * @param events - the session's raw events.
 * @param cwd - the session header's recorded directory.
 * @returns `{ project, title }` (either may be undefined).
 */
export function sessionHints(events, cwd) {
  const root = typeof cwd === 'string' && cwd.length > 0 ? cwd.replace(/[\\/]+$/, '') : undefined
  const counts = new Map()
  let title
  for (const event of events) {
    if (event === null || typeof event !== 'object') continue
    if (typeof event.data?.title === 'string' && event.data.title.length > 0) title = event.data.title
    let text
    try { text = JSON.stringify(event) } catch { continue }
    if (root === undefined) continue
    const prefix = root.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(prefix + '/([A-Za-z0-9._-]+)', 'g')
    let match
    while ((match = regex.exec(text)) !== null) {
      const name = match[1]
      if (name === '.git' || name === 'node_modules') continue
      counts.set(name, (counts.get(name) ?? 0) + 1)
    }
  }
  let project
  let best = 0
  for (const [name, count] of counts) if (count > best) { best = count; project = name }
  if (project === undefined && root !== undefined) {
    const parts = root.split(/[\\/]/).filter(Boolean)
    project = parts[parts.length - 1]
  }
  return { project, title }
}
