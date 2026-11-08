import assert from 'node:assert/strict'
import test from 'node:test'

import {
  allowedRoutes,
  assertAllowed,
  buildCatalog,
  normalizeConfig,
  normalizeRoute,
  resolveRoute,
} from '../src/policy.js'

test('normalizeConfig keeps valid profiles and drops malformed ones', () => {
  const config = normalizeConfig({
    profiles: {
      cheap: { provider: 'p', model: 'm', reasoningEffort: 'high', description: 'fast' },
      broken: { provider: 'p' },
      empty: {},
    },
    allowedModels: [{ provider: 'p', model: 'm' }, { provider: 'p' }],
    defaultProfile: 'cheap',
  })
  assert.equal(config.provider, 'spawn')
  assert.deepEqual(Object.keys(config.profiles), ['cheap'])
  assert.equal(config.profiles.cheap.reasoningEffort, 'high')
  assert.deepEqual(config.allowedModels, [{ provider: 'p', model: 'm' }])
  assert.equal(config.defaultProfile, 'cheap')
})

test('buildCatalog uses configured profiles and defaults to the first', () => {
  const config = normalizeConfig({ profiles: { a: { provider: 'p', model: 'a' }, b: { provider: 'p', model: 'b' } } })
  const catalog = buildCatalog(config, undefined, undefined)
  assert.deepEqual(Object.keys(catalog.profiles), ['a', 'b'])
  assert.equal(catalog.defaultProfile, 'a')
})

test('buildCatalog derives profiles from the model-selection settings', () => {
  const config = normalizeConfig({})
  const catalog = buildCatalog(config, {
    enabled: true,
    allowedModels: [
      { provider: 'deepseek-account', model: 'deepseek-flash' },
      { provider: 'deepseek-account', model: 'deepseek-v4-pro' },
    ],
  }, undefined)
  assert.deepEqual(Object.keys(catalog.profiles), ['deepseek-flash', 'deepseek-v4-pro'])
  assert.equal(catalog.defaultProfile, 'deepseek-flash')
  assert.equal(catalog.profiles['deepseek-flash'].provider, 'deepseek-account')
})

test('buildCatalog falls back to the Lead default selection', () => {
  const catalog = buildCatalog(normalizeConfig({}), undefined, { provider: 'p', model: 'm', reasoningEffort: 'high' })
  assert.deepEqual(catalog.profiles, { m: { provider: 'p', model: 'm' } })
  assert.equal(catalog.defaultProfile, 'm')
})

test('buildCatalog honors a configured default and repairs a missing one', () => {
  const base = normalizeConfig({ profiles: { a: { provider: 'p', model: 'a' }, b: { provider: 'p', model: 'b' } }, defaultProfile: 'b' })
  assert.equal(buildCatalog(base, undefined, undefined).defaultProfile, 'b')
  const missing = normalizeConfig({ profiles: { a: { provider: 'p', model: 'a' } }, defaultProfile: 'ghost' })
  assert.equal(buildCatalog(missing, undefined, undefined).defaultProfile, 'a')
})

test('buildCatalog disambiguates profiles that share a model id', () => {
  const catalog = buildCatalog(normalizeConfig({}), {
    enabled: true,
    allowedModels: [{ provider: 'p', model: 'm' }, { provider: 'q', model: 'm' }],
  }, undefined)
  assert.deepEqual(Object.keys(catalog.profiles), ['m', 'm-2'])
})

test('resolveRoute honors an explicit route and effort', () => {
  const catalog = buildCatalog(normalizeConfig({ profiles: { cheap: { provider: 'p', model: 'm', reasoningEffort: 'low' } } }), undefined, undefined)
  assert.deepEqual(resolveRoute(catalog, { provider: 'x', model: 'y', reasoning_effort: 'high' }), { provider: 'x', model: 'y', reasoningEffort: 'high' })
  assert.deepEqual(resolveRoute(catalog, { provider: 'x', model: 'y' }), { provider: 'x', model: 'y' })
})

test('resolveRoute uses a named profile and its effort, overridable by the request', () => {
  const catalog = buildCatalog(normalizeConfig({ profiles: { cheap: { provider: 'p', model: 'm', reasoningEffort: 'low' } } }), undefined, undefined)
  assert.deepEqual(resolveRoute(catalog, { profile: 'cheap' }), { provider: 'p', model: 'm', reasoningEffort: 'low', profile: 'cheap' })
  assert.deepEqual(resolveRoute(catalog, { profile: 'cheap', reasoning_effort: 'high' }), { provider: 'p', model: 'm', reasoningEffort: 'high', profile: 'cheap' })
})

test('resolveRoute rejects a partial explicit route', () => {
  const catalog = buildCatalog(normalizeConfig({ profiles: { cheap: { provider: 'p', model: 'm' } } }), undefined, undefined)
  assert.throws(() => resolveRoute(catalog, { provider: 'x' }), /together/)
  assert.throws(() => resolveRoute(catalog, { model: 'y' }), /together/)
})

test('resolveRoute rejects an unknown profile and an empty catalog', () => {
  const catalog = buildCatalog(normalizeConfig({ profiles: { cheap: { provider: 'p', model: 'm' } } }), undefined, undefined)
  assert.throws(() => resolveRoute(catalog, { profile: 'deep' }), /unknown delegation profile/)
  assert.throws(() => resolveRoute(buildCatalog(normalizeConfig({}), undefined, undefined), {}), /no delegation profile/)
})

test('allowedRoutes prefers the configured list over the live settings list', () => {
  const config = normalizeConfig({ allowedModels: [{ provider: 'a', model: 'a' }] })
  assert.deepEqual(allowedRoutes(config, { enabled: true, allowedModels: [{ provider: 'b', model: 'b' }] }), [{ provider: 'a', model: 'a' }])
  assert.deepEqual(allowedRoutes(normalizeConfig({}), { enabled: true, allowedModels: [{ provider: 'b', model: 'b' }] }), [{ provider: 'b', model: 'b' }])
  assert.deepEqual(allowedRoutes(normalizeConfig({}), undefined), [])
})

test('assertAllowed enforces an explicit allowlist', () => {
  assert.doesNotThrow(() => assertAllowed({ provider: 'p', model: 'm' }, []))
  assert.throws(() => assertAllowed({ provider: 'p', model: 'm' }, [{ provider: 'p', model: 'x' }]), /not allowed/)
})

test('normalizeRoute ignores blank ids and drops extra fields', () => {
  assert.equal(normalizeRoute({ provider: ' ', model: 'm' }), undefined)
  assert.deepEqual(normalizeRoute({ provider: 'p', model: 'm', extra: 1 }), { provider: 'p', model: 'm' })
})
