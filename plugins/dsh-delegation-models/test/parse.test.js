import assert from 'node:assert/strict'
import test from 'node:test'

import { buildParseMessage, buildRepairMessage, extractJson, normalizeParsed, pickParseRoute } from '../src/parse.js'

test('extractJson accepts a bare object and a fenced one', () => {
  assert.deepEqual(extractJson('{"profiles":[]}'), { profiles: [] })
  assert.deepEqual(extractJson('Here you go:\n```json\n{"profiles":[{"agent_type":"lead"}]}\n```'), {
    profiles: [{ agent_type: 'lead' }],
  })
})

test('extractJson accepts arrays, reasoning tags and prose wrappers', () => {
  assert.deepEqual(extractJson('[{"agent_type":"lead"}]'), [{ agent_type: 'lead' }])
  assert.deepEqual(extractJson('<think>plan</think>{"profiles":[]}'), { profiles: [] })
  assert.deepEqual(extractJson('Sure. ```\n[{"agent_type":"subagent"}]\n``` Done.'), [{ agent_type: 'subagent' }])
})

test('extractJson skips a malformed brace and finds the next JSON value', () => {
  assert.deepEqual(extractJson('use {not json} then {"profiles":[]}'), { profiles: [] })
})

test('extractJson rejects a reply without JSON', () => {
  assert.throws(() => extractJson('no json here'), /JSON object or array/)
})

test('buildRepairMessage embeds the previous reply', () => {
  const message = buildRepairMessage('the rules were prose')
  assert.ok(message.includes('Output only the JSON value.'))
  assert.ok(message.includes('the rules were prose'))
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

test('normalizeParsed accepts a keyed profile map, aliases, and a combined route', () => {
  const keyed = normalizeParsed({
    'lead::orchestration': { role: 'lead', task: 'orchestration', tier: 'capable', route: 'p/m' },
  })
  assert.equal(keyed.ok, true)
  assert.equal(keyed.profiles['lead::orchestration'].provider, 'p')

  const aliases = normalizeParsed([{ role: 'subagent', task: 'extraction', model: 'provider/model' }])
  assert.equal(aliases.ok, true)
  assert.equal(aliases.profiles['subagent::extraction'].provider, 'provider')
  assert.equal(aliases.profiles['subagent::extraction'].tier, 'capable')

  const canonical = normalizeParsed([{ role: 'lead', task: 'review', provider: 'deepseek', model: 'v4-pro' }])
  assert.equal(canonical.ok, true)
  assert.equal(canonical.profiles['lead::review'].provider, 'deepseek-account')
  assert.equal(canonical.profiles['lead::review'].model, 'deepseek-v4-pro')
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

test('pickParseRoute prefers a light or flash row and forces low effort', () => {
  assert.deepEqual(pickParseRoute([
    { tier: 'capable', provider: 'p', model: 'deepseek-v4-pro' },
    { tier: 'light', provider: 'p', model: 'deepseek-flash' },
  ]), { provider: 'p', model: 'deepseek-flash', reasoningEffort: 'low' })
  assert.deepEqual(pickParseRoute([{ provider: 'p', model: 'deepseek-flash' }]), { provider: 'p', model: 'deepseek-flash', reasoningEffort: 'low' })
  assert.deepEqual(pickParseRoute([], { provider: 'p', model: 'm', reasoningEffort: 'high' }), { provider: 'p', model: 'm', reasoningEffort: 'low' })
  assert.equal(pickParseRoute([], undefined), undefined)
})
