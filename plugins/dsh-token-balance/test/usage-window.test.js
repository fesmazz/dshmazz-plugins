import assert from 'node:assert/strict'
import test from 'node:test'

import { hourlyBuckets, sumUsageRecords, usageRecords } from '../src/usage.js'

const HOUR = 3_600_000
const NOW = Date.UTC(2026, 10, 8, 12, 30) // 2026-11-08 12:30 UTC

function event(time, model, usage) {
  return { type: 'assistant/message', time, data: { usage, message: { source: { model } } } }
}

test('usageRecords resolves spellings and keeps the model and time', () => {
  const records = usageRecords([
    event(NOW - HOUR, 'deepseek-flash', { inputTokens: 10, outputTokens: 2, cacheReadTokens: 100, cacheWriteTokens: 1, totalTokens: 113 }),
    { type: 'assistant/message', time: NOW - HOUR, data: { usage: { prompt_tokens: 3, completion_tokens: 4 } } },
    { type: 'assistant/message', data: { usage: { inputTokens: 1 } } },
    { type: 'assistant/message', time: NOW - HOUR, data: {} },
    null,
  ])
  assert.equal(records.length, 2)
  assert.deepEqual(records[0], {
    time: NOW - HOUR,
    model: 'deepseek-flash',
    inputTokens: 10,
    outputTokens: 2,
    cacheReadTokens: 100,
    cacheWriteTokens: 1,
    totalTokens: 113,
  })
  assert.equal(records[1].model, 'unknown')
  assert.equal(records[1].totalTokens, 7)
})

test('usageRecords filters on a half-open time window', () => {
  const records = usageRecords(
    [event(NOW - 2 * HOUR, 'flash', { inputTokens: 1 }), event(NOW - HOUR, 'flash', { inputTokens: 2 }), event(NOW, 'flash', { inputTokens: 3 })],
    { from: NOW - 2 * HOUR, to: NOW },
  )
  assert.deepEqual(records.map((record) => record.inputTokens), [1, 2])
})

test('hourlyBuckets aligns 24 clock hours and keeps the current hour partly empty', () => {
  const report = hourlyBuckets(
    usageRecords([
      event(NOW - 24 * HOUR, 'deepseek-flash', { inputTokens: 1, outputTokens: 0, totalTokens: 1 }),
      event(NOW - 23 * HOUR, 'deepseek-flash', { inputTokens: 2, outputTokens: 0, totalTokens: 2 }),
      event(NOW - 1, 'deepseek-flash', { inputTokens: 4, outputTokens: 0, totalTokens: 4 }),
    ]),
    { now: NOW, costOf: () => 0.5 },
  )
  assert.equal(report.buckets.length, 24)
  assert.equal(report.start, Date.UTC(2026, 10, 7, 13, 0))
  assert.equal(report.end, Date.UTC(2026, 10, 8, 13, 0))
  assert.equal(report.buckets[0].start, report.start)
  assert.equal(report.buckets[23].start, Date.UTC(2026, 10, 8, 12, 0))
  // The first event is before the window start; it is dropped.
  assert.equal(report.totals.inputTokens, 6)
  assert.equal(report.totals.requests, 2)
  assert.equal(report.totals.cost, 1)
  assert.equal(report.buckets[0].models['deepseek-flash'].inputTokens, 2)
  assert.equal(report.buckets[23].models['deepseek-flash'].inputTokens, 4)
})

test('hourlyBuckets excludes events at or after the bucket end', () => {
  const report = hourlyBuckets(usageRecords([event(reportEnd(), 'flash', { inputTokens: 1 })]), { now: NOW })
  assert.equal(report.totals.requests, 0)
})

function reportEnd() {
  return Date.UTC(2026, 10, 8, 13, 0)
}

test('hourlyBuckets separates models and sorts totals by tokens', () => {
  const report = hourlyBuckets(
    usageRecords([
      event(NOW - HOUR, 'deepseek-v4-pro', { inputTokens: 100, outputTokens: 10, totalTokens: 110 }),
      event(NOW - 2 * HOUR, 'deepseek-v4-pro', { inputTokens: 50, outputTokens: 5, totalTokens: 55 }),
      event(NOW - HOUR, 'deepseek-flash', { inputTokens: 900, outputTokens: 100, totalTokens: 1000 }),
    ]),
    { now: NOW, costOf: (record) => record.totalTokens },
  )
  assert.deepEqual(report.models.map((model) => model.id), ['deepseek-flash', 'deepseek-v4-pro'])
  assert.equal(report.models[0].cost, 1000)
  assert.equal(report.models[1].cost, 165)
  assert.equal(report.totals.totalTokens, 1165)
  assert.equal(report.totals.cost, 1165)
})

test('hourlyBuckets on an empty record set still returns 24 zero buckets', () => {
  const report = hourlyBuckets([], { now: NOW })
  assert.equal(report.buckets.length, 24)
  assert.equal(report.models.length, 0)
  assert.equal(report.totals.requests, 0)
  assert.equal(report.totals.cost, 0)
})

test('hourlyBuckets supports 6 hours and 48 hours at two-hour buckets', () => {
  const six = hourlyBuckets([], { now: NOW, hours: 6, bucketMs: 30 * 60 * 1000 })
  assert.equal(six.hours, 6)
  assert.equal(six.buckets.length, 12)
  assert.equal(six.bucketMs, 30 * 60 * 1000)
  assert.equal(six.start, Date.UTC(2026, 10, 8, 7, 0))
  const halfDay = hourlyBuckets([], { now: NOW, hours: 12, bucketMs: 30 * 60 * 1000 })
  assert.equal(halfDay.buckets.length, 24)
  assert.equal(halfDay.start, Date.UTC(2026, 10, 8, 1, 0))
  const day = hourlyBuckets([], { now: NOW, hours: 24 })
  assert.equal(day.buckets.length, 24)
  assert.equal(day.bucketMs, HOUR)
  const long = hourlyBuckets([], { now: NOW, hours: 48, bucketMs: 2 * HOUR })
  assert.equal(long.hours, 48)
  assert.equal(long.buckets.length, 24)
  assert.equal(long.bucketMs, 2 * HOUR)
  assert.equal(long.start, Date.UTC(2026, 10, 6, 14, 0))
})

test('sumUsageRecords totals a session slice and applies the cost callback', () => {
  const totals = sumUsageRecords(usageRecords([
    event(NOW - HOUR, 'deepseek-flash', { inputTokens: 10, outputTokens: 2, cacheReadTokens: 100 }),
    event(NOW - 2 * HOUR, 'deepseek-v4-pro', { inputTokens: 5, outputTokens: 1, totalTokens: 6 }),
  ]), { costOf: (record) => record.totalTokens })
  assert.equal(totals.requests, 2)
  assert.equal(totals.inputTokens, 15)
  assert.equal(totals.outputTokens, 3)
  assert.equal(totals.cacheReadTokens, 100)
  assert.equal(totals.totalTokens, 118)
  assert.equal(totals.cost, 118)
})
