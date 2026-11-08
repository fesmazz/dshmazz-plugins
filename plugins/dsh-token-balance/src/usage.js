/**
 * Pure folding of provider-reported token usage from Session events.
 *
 * The Harness records `assistant/message` events whose `data.usage` carries
 * `inputTokens`, `outputTokens`, `cacheReadTokens`, `cacheWriteTokens` and
 * `totalTokens`. Older adapters use snake_case or prompt/completion spellings,
 * so every count resolves through an ordered list of aliases.
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

/**
 * Sum provider-reported token usage from one event list.
 * @param events - committed Session events.
 * @returns totals across every readable `assistant/message` usage record.
 */
export function sumUsage(events) {
  const total = emptyUsage()
  for (const event of events) {
    if (event === null || typeof event !== 'object' || event.type !== 'assistant/message') continue
    const usage = event.data === null || typeof event.data !== 'object' ? undefined : event.data.usage
    if (usage === null || typeof usage !== 'object') continue
    const input = count(usage, ['inputTokens', 'promptTokens', 'prompt_tokens']) ?? 0
    const output = count(usage, ['outputTokens', 'completionTokens', 'completion_tokens']) ?? 0
    const cacheRead = count(usage, ['cacheReadTokens', 'cachedInputTokens', 'cache_read_tokens']) ?? 0
    const cacheWrite = count(usage, ['cacheWriteTokens', 'cache_write_tokens']) ?? 0
    const combined = count(usage, ['totalTokens', 'total_tokens'])
    total.inputTokens += input
    total.outputTokens += output
    total.cacheReadTokens += cacheRead
    total.cacheWriteTokens += cacheWrite
    total.totalTokens += combined === undefined ? input + output + cacheRead + cacheWrite : combined
    total.requests += 1
  }
  return total
}
