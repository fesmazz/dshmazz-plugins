import assert from 'node:assert/strict'
import test from 'node:test'

import { BUNDLED_RATES, RATE_UNIT, costOf, rateFor, validateRateCard } from '../src/rates.js'

test('the bundled snapshot is a valid card', () => {
  const result = validateRateCard(BUNDLED_RATES)
  assert.equal(result.ok, true)
  assert.equal(result.card.unit, RATE_UNIT)
  assert.equal(result.card.models.length, 2)
})

test('validation reports every offending field', () => {
  const result = validateRateCard({
    version: 2,
    currency: '',
    unit: 'per_token',
    models: [
      { provider: '', model: 'm', input: -1, cacheRead: 0, cacheWrite: 0, output: 0 },
      { provider: 'p', model: 'm', input: 0, cacheRead: 0, cacheWrite: 0, output: 0 },
      { provider: 'p', model: 'm', input: 0, cacheRead: 0, cacheWrite: 0, output: 0 },
    ],
  })
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.includes('version')))
  assert.ok(result.errors.some((error) => error.includes('currency')))
  assert.ok(result.errors.some((error) => error.includes('unit')))
  assert.ok(result.errors.some((error) => error.includes('provider')))
  assert.ok(result.errors.some((error) => error.includes('non-negative')))
  assert.ok(result.errors.some((error) => error.includes('repeats')))
})

test('rateFor matches the exact provider/model route', () => {
  assert.equal(rateFor(BUNDLED_RATES, 'deepseek-account', 'deepseek-flash').model, 'deepseek-flash')
  assert.equal(rateFor(BUNDLED_RATES, 'deepseek-account', 'missing'), undefined)
})

test('costOf estimates input, output, cache read and cache write', () => {
  const cost = costOf(BUNDLED_RATES, 'deepseek-account', 'deepseek-flash', {
    inputTokens: 1_000_000,
    outputTokens: 1_000_000,
    cacheReadTokens: 1_000_000,
    cacheWriteTokens: 1_000_000,
  })
  assert.ok(cost)
  assert.equal(cost.input, 0.28)
  assert.equal(cost.output, 1.1)
  assert.equal(cost.cacheRead, 0.028)
  assert.equal(cost.cacheWrite, 0.28)
  assert.equal(cost.total, 1.688)
})

test('costOf returns undefined for an unrated route', () => {
  assert.equal(costOf(BUNDLED_RATES, 'other', 'model', { inputTokens: 1 }), undefined)
})
