import assert from 'node:assert/strict'
import test from 'node:test'

import {
  mergeProfileRow,
  normalizeProfiles,
  parseProfileKey,
  profileKey,
  profilesToPolicy,
  resolveProfileRow,
} from '../src/profiles.js'

const VALID_ROWS = {
  'lead::orchestration': { agentType: 'lead', taskType: 'orchestration', tier: 'capable', provider: 'p', model: 'm', reasoningEffort: 'low' },
  'subagent::extraction': { agentType: 'subagent', taskType: 'extraction', tier: 'light', provider: 'p', model: 'fast' },
}

test('profile keys round-trip and reject malformed keys', () => {
  assert.equal(profileKey('lead', 'orchestration'), 'lead::orchestration')
  assert.deepEqual(parseProfileKey('lead::orchestration'), { agentType: 'lead', taskType: 'orchestration' })
  assert.equal(parseProfileKey('lead'), undefined)
  assert.equal(parseProfileKey('::orchestration'), undefined)
  assert.equal(parseProfileKey('lead::'), undefined)
})

test('normalizeProfiles accepts a valid row set', () => {
  const result = normalizeProfiles(VALID_ROWS)
  assert.equal(result.ok, true)
  assert.deepEqual(Object.keys(result.profiles), ['lead::orchestration', 'subagent::extraction'])
  assert.equal(result.profiles['lead::orchestration'].reasoningEffort, 'low')
})

test('normalizeProfiles reports unknown categories, tiers and routes', () => {
  const result = normalizeProfiles({
    'bot::orchestration': { tier: 'capable', provider: 'p', model: 'm' },
    'lead::gossip': { tier: 'capable', provider: 'p', model: 'm' },
    'lead::review': { tier: 'frontier', provider: 'p', model: 'm' },
    'lead::cleanup': { tier: 'light', provider: 'p' },
    'lead::planning': { tier: 'light' },
  })
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.includes('unknown agent type')))
  assert.ok(result.errors.some((error) => error.includes('unknown task type')))
  assert.ok(result.errors.some((error) => error.includes('unknown tier')))
  assert.ok(result.errors.some((error) => error.includes('together')))
  assert.ok(result.errors.some((error) => error.includes('must supply a route')))
})

test('profilesToPolicy exposes the row as a policy profile', () => {
  const { profiles } = normalizeProfiles(VALID_ROWS)
  const policy = profilesToPolicy(profiles)
  assert.deepEqual(policy['lead::orchestration'], {
    provider: 'p',
    model: 'm',
    reasoningEffort: 'low',
    description: 'lead · orchestration · capable',
  })
})

test('mergeProfileRow prefers override fields and keeps the base route', () => {
  const base = { agentType: 'lead', taskType: 'review', tier: 'capable', provider: 'p', model: 'm', reasoningEffort: 'low' }
  assert.deepEqual(mergeProfileRow(base, { model: 'm2' }), {
    agentType: 'lead',
    taskType: 'review',
    tier: 'capable',
    provider: 'p',
    model: 'm2',
    reasoningEffort: 'low',
  })
  assert.equal(mergeProfileRow(undefined, { provider: 'p' }), undefined)
})

test('resolveProfileRow prefers a session override and returns undefined when absent', () => {
  const { profiles } = normalizeProfiles(VALID_ROWS)
  const row = resolveProfileRow(profiles, { 'lead::orchestration': { model: 'override' } }, 'lead', 'orchestration')
  assert.equal(row.model, 'override')
  assert.equal(row.provider, 'p')
  assert.equal(resolveProfileRow(profiles, {}, 'reviewer', 'review'), undefined)
})
