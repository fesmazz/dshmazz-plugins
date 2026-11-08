import assert from 'node:assert/strict'
import test from 'node:test'

import { normalizeAccountBalance, normalizeApiKeyBalance, walletsOf } from '../src/balance.js'

test('normalizeAccountBalance projects a ready wallet set', () => {
  const view = normalizeAccountBalance({
    status: 'ready',
    value: [{ currency: 'USD', balance: '2.1500' }],
    bonusWallets: [{ currency: 'USD', balance: '0' }],
  })
  assert.ok(view)
  assert.equal(view.source, 'account')
  assert.equal(view.currency, 'USD')
  assert.equal(view.total, '2.1500')
  assert.deepEqual(view.wallets.map((wallet) => wallet.currency), ['USD'])
  assert.equal(view.bonusWallets.length, 1)
})

test('normalizeAccountBalance returns undefined when unusable', () => {
  assert.equal(normalizeAccountBalance({ status: 'failed' }), undefined)
  assert.equal(normalizeAccountBalance(null), undefined)
  assert.equal(normalizeAccountBalance({ status: 'ready', value: [] }), undefined)
  assert.equal(normalizeAccountBalance({ status: 'ready', value: [null] }), undefined)
})

test('normalizeApiKeyBalance maps the official balance body', () => {
  const view = normalizeApiKeyBalance({
    is_available: true,
    balance_infos: [{ currency: 'CNY', total_balance: '110.00', granted_balance: '10.00', topped_up_balance: '100.00' }],
  })
  assert.equal(view.source, 'api-key')
  assert.equal(view.available, true)
  assert.equal(view.currency, 'CNY')
  assert.equal(view.total, '110.00')
  assert.equal(view.granted, '10.00')
  assert.equal(view.toppedUp, '100.00')
})

test('normalizeApiKeyBalance reports an unavailable account without inventing a total', () => {
  const view = normalizeApiKeyBalance({ is_available: false, balance_infos: [] })
  assert.equal(view.available, false)
  assert.equal(view.total, null)
})

test('walletsOf drops malformed wallet entries', () => {
  assert.deepEqual(walletsOf([{ currency: 'USD' }, null, 'x']), [{ currency: 'USD', balance: null }])
})
