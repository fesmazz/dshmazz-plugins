import assert from 'node:assert/strict'
import test from 'node:test'

import { CATALOG, CATALOG_VERSION, isKnownAgentType, isKnownTaskType, isKnownTier } from '../src/catalog.js'

test('catalog exposes the bundled tiers, agent types and task types', () => {
  assert.equal(CATALOG.version, CATALOG_VERSION)
  assert.deepEqual(CATALOG.tiers.map((tier) => tier.id), ['light', 'capable', 'premium'])
  assert.deepEqual(CATALOG.agentTypes.map((type) => type.id), ['lead', 'teammate', 'subagent', 'reviewer'])
  assert.equal(CATALOG.taskTypes.length, 8)
})

test('catalog membership checks accept known ids and reject others', () => {
  assert.equal(isKnownTier('capable'), true)
  assert.equal(isKnownTier('frontier'), false)
  assert.equal(isKnownAgentType('reviewer'), true)
  assert.equal(isKnownAgentType('bot'), false)
  assert.equal(isKnownTaskType('security-review'), true)
  assert.equal(isKnownTaskType('gossip'), false)
})
