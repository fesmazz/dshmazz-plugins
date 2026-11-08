import assert from 'node:assert/strict'
import test from 'node:test'

import { createSourceWatcher } from '../src/watcher.js'

test('start watches the path and onChange receives the file text', async () => {
  const calls = []
  let listener
  const watcher = createSourceWatcher({
    watchFile: (path, options, next) => { calls.push({ path, options }); listener = next },
    unwatchFile: (path) => calls.push({ unwatched: path }),
    readFile: async () => 'rules',
    onChange: async (text) => calls.push({ text }),
  })
  watcher.start('/tmp/rules.md')
  assert.equal(watcher.current(), '/tmp/rules.md')
  assert.deepEqual(calls[0], { path: '/tmp/rules.md', options: { interval: 1500 } })
  listener()
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.deepEqual(calls[1], { text: 'rules' })
})

test('start replaces the previous watch and stop unwatches', () => {
  const calls = []
  const watcher = createSourceWatcher({
    watchFile: (path) => calls.push({ watched: path }),
    unwatchFile: (path) => calls.push({ unwatched: path }),
    readFile: async () => '',
    onChange: async () => {},
  })
  watcher.start('/a')
  watcher.start('/b')
  assert.deepEqual(calls, [{ watched: '/a' }, { unwatched: '/a' }, { watched: '/b' }])
  watcher.stop()
  assert.deepEqual(calls, [{ watched: '/a' }, { unwatched: '/a' }, { watched: '/b' }, { unwatched: '/b' }])
  watcher.stop()
  assert.equal(watcher.current(), undefined)
})

test('a failing read is contained and the next change still runs', async () => {
  let listener
  let changes = 0
  const watcher = createSourceWatcher({
    watchFile: (_path, _options, next) => { listener = next },
    unwatchFile: () => {},
    readFile: async () => { changes += 1; if (changes === 1) throw new Error('read failed'); return 'ok' },
    onChange: async () => { changes += 10 },
  })
  watcher.start('/tmp/rules.md')
  listener()
  await new Promise((resolve) => setTimeout(resolve, 0))
  listener()
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.equal(changes, 12)
})
