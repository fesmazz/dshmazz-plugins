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
