/**
 * Watch one auto-configure source file and re-apply it on change.
 *
 * Node's `watchFile` polls; the watcher coalesces overlapping changes and reads
 * the file before invoking the asynchronous callback. Dependencies are
 * injectable so tests never touch the filesystem.
 */

import { readFileSync, unwatchFile, watchFile } from 'node:fs'

/**
 * Create a source-file watcher.
 * @param options - `onChange(text)`, optional `readFile(path)`, `watchFile`,
 *   `unwatchFile`, and `interval`.
 * @returns `{ start(path), stop(), current() }`.
 */
export function createSourceWatcher(options) {
  const watch = options.watchFile ?? watchFile
  const unwatch = options.unwatchFile ?? unwatchFile
  const read = options.readFile ?? ((path) => readFileSync(path, 'utf8'))
  const interval = options.interval ?? 1_500
  let path
  let inFlight = false

  function stop() {
    if (path === undefined) return
    try {
      unwatch(path)
    } catch {
      // Already unwatched.
    }
    path = undefined
  }

  function start(filePath) {
    stop()
    path = filePath
    watch(filePath, { interval }, () => {
      void (async () => {
        if (inFlight) return
        inFlight = true
        try {
          const text = await read(filePath)
          await options.onChange(text)
        } catch {
          // A read/parse failure is reported through the callback owner.
        } finally {
          inFlight = false
        }
      })()
    })
  }

  return { start, stop, current: () => path }
}
