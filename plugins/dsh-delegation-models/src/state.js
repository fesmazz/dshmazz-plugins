/**
 * Small JSON state store for profiles, rates and the auto-configure source.
 *
 * The store lives under the active profile directory (`DSH_PROFILE_DIR`) when
 * one is present, and falls back to memory otherwise, so tests and the headless
 * host never require a writable home. Writes are atomic (temp file + rename).
 */

import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { BUNDLED_RATES } from './rates.js'

/** Current state document version. */
export const STATE_VERSION = 1

/** A detached empty state document. */
export function defaultState() {
  return {
    version: STATE_VERSION,
    profiles: {},
    defaultProfile: undefined,
    allowedModels: [],
    rates: BUNDLED_RATES,
    source: null,
  }
}

/** Resolve the default state directory from the harness environment. */
export function defaultStateDirectory() {
  const profile = process.env.DSH_PROFILE_DIR
  return profile === undefined || profile.length === 0 ? undefined : profile
}

/**
 * Create a state store bound to one directory (or memory when omitted).
 * @param directory - profile directory, or undefined for an in-memory store.
 * @returns read/write functions and the resolved file path.
 */
export function createStateStore(directory) {
  const path = directory === undefined ? undefined : join(directory, 'delegation-models', 'state.json')
  let memory = defaultState()

  function read() {
    if (path === undefined) return memory
    try {
      const parsed = JSON.parse(readFileSync(path, 'utf8'))
      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return defaultState()
      return { ...defaultState(), ...parsed }
    } catch {
      return defaultState()
    }
  }

  function write(patch) {
    const next = { ...read(), ...patch, version: STATE_VERSION }
    if (path === undefined) {
      memory = next
      return next
    }
    mkdirSync(join(path, '..'), { recursive: true })
    const temporary = `${path}.tmp`
    writeFileSync(temporary, `${JSON.stringify(next, null, 2)}\n`, 'utf8')
    renameSync(temporary, path)
    return next
  }

  /** Remove the persisted file (tests and a deliberate reset). */
  function clear() {
    if (path !== undefined) {
      try {
        rmSync(path)
      } catch {
        // Already absent.
      }
    }
    memory = defaultState()
  }

  return { path, read, write, clear }
}
