import assert from 'node:assert/strict'
import test from 'node:test'

import { detectTeammateRouting } from '../src/capabilities.js'

const spawnSchema = (properties) => ({ name: 'spawn_teammate', parameters: { type: 'object', properties } })

test('detects the patched spawn_teammate tool', () => {
  const result = detectTeammateRouting({
    schemas: [spawnSchema({ provider: {}, model: {}, reasoning_effort: {}, prompt: {} })],
    modelSelection: true,
  })
  assert.equal(result.mode, 'patched')
  assert.equal(result.tool, 'spawn_teammate')
  assert.deepEqual(result.parameters.sort(), ['model', 'prompt', 'provider', 'reasoning_effort'])
})

test('detects a stock spawn_teammate as unpatched', () => {
  const result = detectTeammateRouting({ schemas: [spawnSchema({ prompt: {}, reasoning_effort: {} })] })
  assert.equal(result.mode, 'unpatched')
})

test('detects the native subagent path when spawn_teammate is gone', () => {
  const native = detectTeammateRouting({
    schemas: [{ name: 'subagent', parameters: { properties: { provider: {}, model: {} } } }],
    modelSelection: true,
  })
  assert.equal(native.mode, 'native')
  assert.equal(native.tool, 'subagent')
  assert.equal(detectTeammateRouting({
    schemas: [{ name: 'subagent', parameters: { properties: {} } }],
    modelSelection: false,
  }).mode, 'native-unselected')
})

test('reports unsupported when neither tool is visible', () => {
  assert.deepEqual(detectTeammateRouting({ schemas: [] }), { mode: 'unsupported', tool: null, parameters: [] })
})
