import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createStateStore, defaultState, STATE_VERSION } from '../src/state.js'

function withDirectory(run) {
  const directory = mkdtempSync(join(tmpdir(), 'dsh-delegation-models-'))
  try {
    return run(directory)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

test('an in-memory store starts from the default state', () => {
  const store = createStateStore(undefined)
  assert.equal(store.path, undefined)
  assert.deepEqual(store.read(), defaultState())
})

test('a directory store persists and merges writes', () => {
  withDirectory((directory) => {
    const store = createStateStore(directory)
    assert.equal(store.read().version, STATE_VERSION)
    store.write({ profiles: { 'lead::orchestration': { provider: 'p', model: 'm' } } })
    store.write({ defaultProfile: 'lead::orchestration' })

    const reopened = createStateStore(directory)
    const state = reopened.read()
    assert.equal(state.defaultProfile, 'lead::orchestration')
    assert.equal(state.profiles['lead::orchestration'].model, 'm')
    assert.equal(state.rates.models.length, 2)
  })
})

test('a corrupt file falls back to the default state', () => {
  withDirectory((directory) => {
    const store = createStateStore(directory)
    store.write({ defaultProfile: 'x' })
    writeFileSync(store.path, '{not json', 'utf8')
    assert.deepEqual(store.read(), defaultState())
  })
})

test('clear removes the persisted document', () => {
  withDirectory((directory) => {
    const store = createStateStore(directory)
    store.write({ defaultProfile: 'x' })
    store.clear()
    assert.equal(store.read().defaultProfile, undefined)
  })
})
