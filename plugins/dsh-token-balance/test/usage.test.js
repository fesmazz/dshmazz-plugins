import assert from 'node:assert/strict'
import test from 'node:test'

import { emptyUsage, pickAxisMax, projectOf, sessionBreakdown, sumUsage } from '../src/usage.js'

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


test('pickAxisMax chooses the smallest allowed range that fits, floored at 0.5', () => {
  assert.equal(pickAxisMax([0]), 0.5)
  assert.equal(pickAxisMax([0.5]), 0.5)
  assert.equal(pickAxisMax([0.6]), 1)
  assert.equal(pickAxisMax([1.9]), 2)
  assert.equal(pickAxisMax([3]), 5)
  assert.equal(pickAxisMax([60]), 100)
  assert.equal(pickAxisMax([200]), 100)
})

test('projectOf reads the last path segment of a session header', () => {
  assert.equal(projectOf({ cwd: '/Users/x/Projects/dshmazz-plugins' }), 'dshmazz-plugins')
  assert.equal(projectOf({ workspace: '/Users/x/Projects/Hundun' }), 'Hundun')
  assert.equal(projectOf({}), 'Unknown project')
})

test('sessionBreakdown groups records by project and by session', () => {
  const meta = new Map([
    ['s1', { header: { cwd: '/p/one', title: 'One' } }],
    ['s2', { header: { cwd: '/p/two' } }],
  ])
  const breakdown = sessionBreakdown([
    { sessionId: 's1', totalTokens: 100, requests: 1 },
    { sessionId: 's1', totalTokens: 50, requests: 1 },
    { sessionId: 's2', totalTokens: 25, requests: 1 },
  ], meta, (record) => record.totalTokens / 100)
  assert.equal(breakdown.projects.length, 2)
  assert.equal(breakdown.projects[0].name, 'one')
  assert.equal(breakdown.projects[0].cost, 1.5)
  assert.equal(breakdown.sessions.length, 2)
  assert.equal(breakdown.sessions[0].id, 's1')
})
