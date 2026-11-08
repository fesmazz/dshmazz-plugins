import assert from 'node:assert/strict'
import test from 'node:test'

import { buildParseMessage, extractJson, normalizeParsed } from '../src/parse.js'

test('extractJson accepts a bare object and a fenced one', () => {
  assert.deepEqual(extractJson('{"profiles":[]}'), { profiles: [] })
  assert.deepEqual(extractJson('Here you go:\n```json\n{"profiles":[{"agent_type":"lead"}]}\n```'), {
    profiles: [{ agent_type: 'lead' }],
  })
})

test('extractJson rejects a reply without JSON', () => {
  assert.throws(() => extractJson('no json here'), /JSON object/)
})

test('normalizeParsed maps array entries to rows', () => {
  const result = normalizeParsed({
    profiles: [
      { agent_type: 'lead', task_type: 'orchestration', tier: 'capable', provider: 'p', model: 'm', reasoning_effort: 'low' },
      { agentType: 'subagent', taskType: 'extraction', tier: 'light', provider: 'p', model: 'fast' },
    ],
  })
  assert.equal(result.ok, true)
  assert.deepEqual(Object.keys(result.profiles), ['lead::orchestration', 'subagent::extraction'])
  assert.equal(result.profiles['lead::orchestration'].reasoningEffort, 'low')
})

test('normalizeParsed rejects unknown categories through the row validator', () => {
  const result = normalizeParsed({ profiles: [{ agent_type: 'bot', task_type: 'orchestration', tier: 'capable', provider: 'p', model: 'm' }] })
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.includes('unknown agent type')))
})

test('normalizeParsed rejects an empty or malformed list', () => {
  assert.equal(normalizeParsed({}).ok, false)
  assert.equal(normalizeParsed({ profiles: [] }).ok, false)
})

test('buildParseMessage truncates and prefixes the rules', () => {
  const message = buildParseMessage('x'.repeat(30_000))
  assert.ok(message.startsWith('Rules:\n'))
  assert.equal(message.length, 'Rules:\n'.length + 20_000)
})
