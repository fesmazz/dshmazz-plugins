import assert from 'node:assert/strict'
import test from 'node:test'

import { addUsage, emptyUsage, sumUsage } from '../src/usage.js'

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

test('sumUsage reads camelCase and snake_case usage records', () => {
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

test('addUsage combines two records field by field', () => {
  const combined = addUsage(
    { inputTokens: 1, outputTokens: 2, cacheReadTokens: 3, cacheWriteTokens: 4, totalTokens: 10, requests: 1 },
    { inputTokens: 10, outputTokens: 20, cacheReadTokens: 30, cacheWriteTokens: 40, totalTokens: 100, requests: 2 },
  )
  assert.deepEqual(combined, {
    inputTokens: 11,
    outputTokens: 22,
    cacheReadTokens: 33,
    cacheWriteTokens: 44,
    totalTokens: 110,
    requests: 3,
  })
})
