import assert from 'node:assert/strict'
import test from 'node:test'

import { apply } from '../index.js'
import { DEFAULT_RATES, costOfUsage, normalizeRates } from '../src/pricing.js'

// The ambient key must not turn a unit test into a network call.
process.env.DEEPSEEK_API_KEY = ''

const HOUR = 3_600_000
const RATES = normalizeRates(DEFAULT_RATES, 'test')

function usage(inputTokens, extra = {}) {
  return { inputTokens, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, totalTokens: inputTokens, ...extra }
}

function message(time, model, counts) {
  return { type: 'assistant/message', time, data: { usage: counts, message: { source: { model } } } }
}

function harness(options = {}) {
  const sessions = options.sessions ?? []
  let handler
  const ctx = {
    get(name) {
      if (name === 'sessions') {
        return { list: () => sessions, get: (id) => sessions.find((session) => session.id === id) }
      }
      if (name === 'sessionQuery') return options.sessionQuery
      if (name === 'deepseekAccount') return options.account
      return undefined
    },
    effect(fn) {
      fn()
      return () => {}
    },
    webServer: {
      register(config) {
        handler = config.handler
        return () => {}
      },
    },
  }
  apply(ctx)
  return {
    async call() {
      let captured
      const res = {
        writeHead(status) {
          captured = { status, headers: undefined, body: undefined }
        },
        end(body) {
          captured.body = JSON.parse(body)
        },
      }
      await handler({ url: '/dsh-token-balance' }, res)
      return captured
    },
  }
}

function readyAccount(total = '10.35') {
  return {
    async getBalance() {
      return { status: 'ready', value: [{ currency: 'USD', balance: total }], bonusWallets: [] }
    },
  }
}

test('the route reports balance and a 24-hour per-model usage window', async () => {
  const now = Date.now()
  const flashTime = now - HOUR
  const proTime = now - 2 * HOUR
  const events = [
    message(flashTime, 'deepseek-flash', usage(1_000_000)),
    message(proTime, 'deepseek-v4-pro', usage(2_000_000)),
  ]
  const session = {
    id: 's1',
    header: { id: 's1', createdAt: now - 3 * HOUR },
    seq: events.length,
    snapshotEvents: () => events,
  }
  const result = await harness({ sessions: [session], account: readyAccount() }).call()
  assert.equal(result.status, 200)
  const { balance, window, rates } = result.body
  assert.equal(balance.total, '10.35')
  assert.equal(rates.currency, 'USD')
  assert.equal(window.buckets.length, 24)
  assert.equal(window.totals.requests, 2)
  assert.equal(window.totals.totalTokens, 3_000_000)
  assert.deepEqual(window.models.map((model) => model.id), ['deepseek-v4-pro', 'deepseek-flash'])
  const expected =
    costOfUsage(RATES, 'deepseek-flash', flashTime, usage(1_000_000)) +
    costOfUsage(RATES, 'deepseek-v4-pro', proTime, usage(2_000_000))
  assert.ok(Math.abs(window.totals.cost - expected) < 1e-9, 'estimated cost uses per-model peak/off-peak prices')
})

test('the route reads persisted sessions through sessionQuery', async () => {
  const now = Date.now()
  const events = [message(now - 30 * 60_000, 'deepseek-flash', usage(4_000))]
  const sessionQuery = {
    async listSessions() {
      return [{ header: { id: 'p1', createdAt: now - 5 * HOUR }, live: false, persisted: true }]
    },
    async readSession() {
      return { events }
    },
  }
  const result = await harness({ sessionQuery }).call()
  assert.equal(result.status, 200)
  assert.equal(result.body.window.totals.requests, 1)
  assert.equal(result.body.window.totals.totalTokens, 4_000)
})

test('one unreadable session does not blank the report', async () => {
  const now = Date.now()
  const sessionQuery = {
    async listSessions() {
      return [
        { header: { id: 'bad', createdAt: now - HOUR }, live: false },
        { header: { id: 'good', createdAt: now - HOUR }, live: false },
      ]
    },
    async readSession(id) {
      if (id === 'bad') throw new Error('corrupt')
      return { events: [message(now - 1_000, 'deepseek-flash', usage(10))] }
    },
  }
  const result = await harness({ sessionQuery }).call()
  assert.equal(result.status, 200)
  assert.equal(result.body.window.totals.requests, 1)
})

test('an empty history still returns a zeroed 24-hour window', async () => {
  const result = await harness({}).call()
  assert.equal(result.status, 200)
  assert.equal(result.body.window.buckets.length, 24)
  assert.equal(result.body.window.totals.requests, 0)
  assert.deepEqual(result.body.window.models, [])
  assert.equal(result.body.balance.configured, false)
})
