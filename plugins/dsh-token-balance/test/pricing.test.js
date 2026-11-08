import assert from 'node:assert/strict'
import test from 'node:test'

import {
  DEFAULT_RATES,
  costOfUsage,
  isPeak,
  modelRates,
  normalizeRates,
  ratesFor,
} from '../src/pricing.js'

const MONDAY_PEAK = Date.UTC(2026, 10, 9, 2, 0) // 2026-11-09 02:00 UTC, Monday
const MONDAY_OFF_PEAK = Date.UTC(2026, 10, 9, 5, 0) // 05:00 UTC
const SATURDAY_PEAK_HOUR = Date.UTC(2026, 10, 7, 2, 0) // Saturday

test('defaults carry the official DeepSeek list prices', () => {
  assert.equal(DEFAULT_RATES.models['deepseek-flash'].peak.cacheMiss, 0.3)
  assert.equal(DEFAULT_RATES.models['deepseek-flash'].offPeak.cacheHit, 0.003)
  assert.equal(DEFAULT_RATES.models['deepseek-v4-pro'].peak.output, 3.96)
  assert.equal(DEFAULT_RATES.models['deepseek-v4-pro'].offPeak.cacheMiss, 0.66)
})

test('peak hours are the two advertised UTC windows on weekdays', () => {
  assert.equal(isPeak(MONDAY_PEAK), true)
  assert.equal(isPeak(MONDAY_OFF_PEAK), false)
  assert.equal(isPeak(SATURDAY_PEAK_HOUR), false)
  assert.equal(isPeak(Date.UTC(2026, 10, 9, 0, 59)), false)
  assert.equal(isPeak(Date.UTC(2026, 10, 9, 1, 0)), true)
  assert.equal(isPeak(Date.UTC(2026, 10, 9, 3, 59)), true)
  assert.equal(isPeak(Date.UTC(2026, 10, 9, 4, 0)), false)
  assert.equal(isPeak(Date.UTC(2026, 10, 9, 6, 0)), true)
  assert.equal(isPeak(Date.UTC(2026, 10, 9, 9, 59)), true)
  assert.equal(isPeak(Date.UTC(2026, 10, 9, 10, 0)), false)
})

test('normalizeRates merges partial overrides over the defaults', () => {
  const rates = normalizeRates(
    {
      currency: 'USD',
      peakHoursUtc: [[12, 13]],
      models: {
        'deepseek-flash': { peak: { output: 2 } },
      },
    },
    'config',
  )
  assert.equal(rates.source, 'config')
  assert.deepEqual(rates.peakHoursUtc, [[12, 13]])
  assert.equal(rates.models['deepseek-flash'].peak.output, 2)
  assert.equal(rates.models['deepseek-flash'].peak.cacheMiss, 0.3)
  assert.equal(rates.models['deepseek-flash'].offPeak.output, 0.6)
  assert.equal(rates.models['deepseek-v4-pro'].peak.output, 3.96)
})

test('normalizeRates keeps an unknown model with flash fallback rates', () => {
  const rates = normalizeRates({ models: { 'deepseek-chat': { peak: { cacheMiss: 9 } } } })
  assert.equal(rates.models['deepseek-chat'].peak.cacheMiss, 9)
  assert.equal(rates.models['deepseek-chat'].peak.output, 1.2)
  assert.equal(rates.models['deepseek-chat'].offPeak.cacheMiss, 0.15)
})

test('malformed tables fall back to the defaults', () => {
  const rates = normalizeRates(null, 'defaults')
  assert.equal(rates.source, 'defaults')
  assert.deepEqual(rates.peakHoursUtc, [[1, 4], [6, 10]])
  assert.equal(rates.models['deepseek-flash'].peak.cacheMiss, 0.3)
})

test('costOfUsage prices cache-miss, cache-hit and output tokens at the right tier', () => {
  const usage = { inputTokens: 1_000_000, cacheReadTokens: 1_000_000, outputTokens: 1_000_000, cacheWriteTokens: 0 }
  assert.equal(costOfUsage(DEFAULT_RATES, 'deepseek-flash', MONDAY_PEAK, usage), 0.3 + 0.006 + 1.2)
  assert.equal(costOfUsage(DEFAULT_RATES, 'deepseek-flash', MONDAY_OFF_PEAK, usage), 0.15 + 0.003 + 0.6)
  assert.equal(costOfUsage(DEFAULT_RATES, 'deepseek-v4-pro', MONDAY_PEAK, usage), 1.32 + 0.044 + 3.96)
  assert.equal(costOfUsage(DEFAULT_RATES, 'deepseek-v4-pro', MONDAY_OFF_PEAK, usage), 0.66 + 0.022 + 1.98)
})

test('costOfUsage is zero for malformed or empty usage', () => {
  assert.equal(costOfUsage(DEFAULT_RATES, 'deepseek-flash', MONDAY_PEAK, null), 0)
  assert.equal(costOfUsage(DEFAULT_RATES, 'deepseek-flash', MONDAY_PEAK, {}), 0)
  assert.equal(costOfUsage(DEFAULT_RATES, 'deepseek-flash', MONDAY_PEAK, { inputTokens: -5 }), 0)
})

test('ratesFor and modelRates resolve unknown models to flash', () => {
  assert.equal(modelRates(DEFAULT_RATES, 'deepseek-v4-pro'), DEFAULT_RATES.models['deepseek-v4-pro'])
  assert.equal(modelRates(DEFAULT_RATES, 'nope'), DEFAULT_RATES.models['deepseek-flash'])
  assert.equal(ratesFor(DEFAULT_RATES, 'nope', MONDAY_PEAK), DEFAULT_RATES.models['deepseek-flash'].peak)
})
