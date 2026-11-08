import assert from 'node:assert/strict'
import test from 'node:test'

import { emptyUsage, sumUsage } from '../src/usage.js'

test('emptyUsage starts every counter at zero', () => {
  assert.deepEqual(emptyUsage(), {
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    totalTokens: 0,
    requests: 0,
  })
})

test('sumUsage totals assistant message usage and ignores other events', () => {
  const events = [
    { type: 'turn/start', data: {} },
    { type: 'assistant/message', data: { usage: { inputTokens: 10, outputTokens: 5, cacheReadTokens: 100, cacheWriteTokens: 0, totalTokens: 115 } } },
    { type: 'assistant/message', data: { usage: { prompt_tokens: 2, completion_tokens: 3 } } },
    { type: 'assistant/message', data: {} },
    { type: 'assistant/message' },
    null,
  ]

  assert.deepEqual(sumUsage(events), {
    inputTokens: 12,
    outputTokens: 8,
    cacheReadTokens: 100,
    cacheWriteTokens: 0,
    totalTokens: 120,
    requests: 2,
  })
})

test('sumUsage falls back to the sum when a record omits the total', () => {
  const total = sumUsage([
    { type: 'assistant/message', data: { usage: { inputTokens: 1, outputTokens: 2, cacheReadTokens: 3, cacheWriteTokens: 4 } } },
  ])
  assert.equal(total.totalTokens, 10)
})
