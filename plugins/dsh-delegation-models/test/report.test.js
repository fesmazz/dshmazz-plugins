import assert from 'node:assert/strict'
import test from 'node:test'

import { BUNDLED_RATES } from '../src/rates.js'
import { summarizeAgents } from '../src/report.js'

const usage = (input, output) => ({
  inputTokens: input,
  outputTokens: output,
  cacheReadTokens: 0,
  cacheWriteTokens: 0,
  totalTokens: input + output,
  requests: 1,
})

test('separates team and subagent rows and totals cost', () => {
  const report = summarizeAgents([
    { id: 'a', name: 'lead', role: 'lead', provider: 'deepseek-account', model: 'deepseek-flash', usage: usage(1_000_000, 0) },
    { id: 'b', name: 'impl', role: 'teammate', provider: 'deepseek-account', model: 'deepseek-v4-pro', usage: usage(1_000_000, 0) },
    { id: 'c', name: 'review', role: 'subagent', provider: 'deepseek-account', model: 'deepseek-flash', usage: usage(0, 1_000_000) },
  ], BUNDLED_RATES)

  assert.deepEqual(report.team.map((row) => row.name), ['lead', 'impl'])
  assert.deepEqual(report.subagents.map((row) => row.name), ['review'])
  assert.equal(report.team[0].cost, 0.28)
  assert.equal(report.team[1].cost, 0.55)
  assert.equal(report.subagents[0].cost, 1.1)
  assert.equal(report.totals.cost, 1.93)
  assert.equal(report.totals.usage.totalTokens, 3_000_000)
  assert.equal(report.byModel.length, 2)
})

test('unrated routes keep a null cost and do not enter the model split', () => {
  const report = summarizeAgents([
    { id: 'a', name: 'x', role: 'subagent', provider: 'unknown', model: 'nope', usage: usage(100, 100) },
  ], BUNDLED_RATES)
  assert.equal(report.subagents[0].cost, null)
  assert.equal(report.totals.cost, 0)
  assert.equal(report.byModel.length, 0)
})

test('empty input returns zeroed totals', () => {
  const report = summarizeAgents([], BUNDLED_RATES)
  assert.deepEqual(report.team, [])
  assert.deepEqual(report.subagents, [])
  assert.equal(report.totals.cost, 0)
  assert.equal(report.totals.usage.requests, 0)
})
