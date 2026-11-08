/**
 * Delegation profile rows.
 *
 * A row addresses one agent type × task type and carries a model tier plus the
 * exact route and effort. Rows are stored by key (`agentType::taskType`), may be
 * overridden per session, and convert to the policy profile shape the routing
 * code already understands.
 */

import { isKnownAgentType, isKnownTaskType, isKnownTier } from './catalog.js'

/** Separator between the agent type and task type in a row key. */
export const PROFILE_SEPARATOR = '::'

/** Build the stable key for one agent type and task type. */
export function profileKey(agentType, taskType) {
  return `${agentType}${PROFILE_SEPARATOR}${taskType}`
}

/**
 * Split a row key into its parts.
 * @param key - candidate key such as `lead::orchestration`.
 * @returns the parts, or undefined when the key is malformed.
 */
export function parseProfileKey(key) {
  if (typeof key !== 'string') return undefined
  const index = key.indexOf(PROFILE_SEPARATOR)
  if (index <= 0) return undefined
  const agentType = key.slice(0, index)
  const taskType = key.slice(index + PROFILE_SEPARATOR.length)
  if (taskType.length === 0 || taskType.includes(PROFILE_SEPARATOR)) return undefined
  return { agentType, taskType }
}

function isText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function optionalText(value) {
  return isText(value) ? value : undefined
}

/**
 * Validate and normalize profile rows.
 * @param value - candidate rows keyed by `agentType::taskType`.
 * @returns `{ ok, errors, profiles }`; profiles is a detached normalized map.
 */
export function normalizeProfiles(value) {
  const errors = []
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, errors: ['profiles must be an object keyed by agentType::taskType'], profiles: {} }
  }
  const profiles = {}
  for (const [key, row] of Object.entries(value)) {
    const parts = parseProfileKey(key)
    if (parts === undefined) {
      errors.push(`profile key "${key}" must be agentType${PROFILE_SEPARATOR}taskType`)
      continue
    }
    if (row === null || typeof row !== 'object' || Array.isArray(row)) {
      errors.push(`profile "${key}" must be an object`)
      continue
    }
    if (!isKnownAgentType(parts.agentType)) errors.push(`profile "${key}" has unknown agent type "${parts.agentType}"`)
    if (!isKnownTaskType(parts.taskType)) errors.push(`profile "${key}" has unknown task type "${parts.taskType}"`)
    if (!isKnownTier(row.tier)) errors.push(`profile "${key}" has unknown tier "${String(row.tier)}"`)
    const provider = optionalText(row.provider)
    const model = optionalText(row.model)
    if ((provider === undefined) !== (model === undefined)) {
      errors.push(`profile "${key}" must supply provider and model together`)
      continue
    }
    if (provider === undefined) errors.push(`profile "${key}" must supply a route`)
    profiles[key] = {
      agentType: parts.agentType,
      taskType: parts.taskType,
      tier: row.tier,
      provider,
      model,
      ...optionalText(row.reasoningEffort) === undefined ? {} : { reasoningEffort: optionalText(row.reasoningEffort) },
      ...optionalText(row.description) === undefined ? {} : { description: optionalText(row.description) },
    }
  }
  return { ok: errors.length === 0, errors, profiles: errors.length === 0 ? profiles : {} }
}

/**
 * Convert rows to the policy profile shape (name → route).
 * @param profiles - normalized rows.
 * @returns policy profiles keyed by row key.
 */
export function profilesToPolicy(profiles) {
  const policy = {}
  for (const [key, row] of Object.entries(profiles ?? {})) {
    policy[key] = {
      provider: row.provider,
      model: row.model,
      ...row.reasoningEffort === undefined ? {} : { reasoningEffort: row.reasoningEffort },
      description: `${row.agentType} · ${row.taskType} · ${row.tier}`,
    }
  }
  return policy
}

/**
 * Merge one session row override over its global row.
 * @param base - global normalized row, or undefined.
 * @param override - partial override (provider/model/effort/tier).
 * @returns the merged row, or undefined when neither side names a route.
 */
export function mergeProfileRow(base, override) {
  const provider = optionalText(override?.provider) ?? base?.provider
  const model = optionalText(override?.model) ?? base?.model
  if (provider === undefined || model === undefined) return undefined
  return {
    agentType: base?.agentType ?? override?.agentType,
    taskType: base?.taskType ?? override?.taskType,
    tier: optionalText(override?.tier) ?? base?.tier,
    provider,
    model,
    ...(optionalText(override?.reasoningEffort) ?? base?.reasoningEffort) === undefined
      ? {}
      : { reasoningEffort: optionalText(override?.reasoningEffort) ?? base?.reasoningEffort },
    ...(base?.description === undefined ? {} : { description: base.description }),
  }
}

/**
 * Resolve one row for an agent type and task type, preferring a session override.
 * @param profiles - normalized global rows.
 * @param overrideRows - session override rows keyed the same way.
 * @param agentType - agent type id.
 * @param taskType - task type id.
 * @returns the resolved row and its key, or undefined.
 */
export function resolveProfileRow(profiles, overrideRows, agentType, taskType) {
  const key = profileKey(agentType, taskType)
  const base = profiles?.[key]
  const override = overrideRows?.[key]
  if (base === undefined && override === undefined) return undefined
  const row = mergeProfileRow(base, override)
  return row === undefined ? undefined : { key, ...row }
}
