/**
 * Bundled delegation categories.
 *
 * Copied and generalized from the owner's current model guidelines on
 * 2026-11-07 so the plugin owns its taxonomy; nothing here links back to an
 * external file. The categories are the targets the auto-configure mapping and
 * the profiles page edit against.
 */

/** Version stamp of the copied catalog. */
export const CATALOG_VERSION = '2026-11-07'

/** Model tiers, least to most costly. */
export const TIERS = Object.freeze([
  {
    id: 'light',
    title: 'Light',
    description: 'Qualified light model for simple, repetitive or well-precedented work.',
  },
  {
    id: 'capable',
    title: 'Capable non-premium',
    description: 'Default for implementation, review and planning unless a lighter model qualifies.',
  },
  {
    id: 'premium',
    title: 'Premium',
    description: 'Bounded hard questions only; the premium approval gate applies.',
  },
])

/** Agent kinds a delegation profile can address. */
export const AGENT_TYPES = Object.freeze([
  { id: 'lead', title: 'Lead' },
  { id: 'teammate', title: 'Teammate' },
  { id: 'subagent', title: 'Subagent' },
  { id: 'reviewer', title: 'Reviewer' },
])

/** Task classes a delegation profile can address. */
export const TASK_TYPES = Object.freeze([
  { id: 'orchestration', title: 'Orchestration' },
  { id: 'planning', title: 'Planning' },
  { id: 'implementation', title: 'Implementation' },
  { id: 'review', title: 'Review' },
  { id: 'security-review', title: 'Security review' },
  { id: 'verification', title: 'Verification' },
  { id: 'extraction', title: 'Extraction' },
  { id: 'cleanup', title: 'Cleanup' },
])

/** The whole catalog in one detached value. */
export const CATALOG = Object.freeze({
  version: CATALOG_VERSION,
  tiers: TIERS,
  agentTypes: AGENT_TYPES,
  taskTypes: TASK_TYPES,
})

function hasId(list, id) {
  return list.some((entry) => entry.id === id)
}

/** Whether one model tier id exists in the bundled catalog. */
export function isKnownTier(id) {
  return hasId(TIERS, id)
}

/** Whether one agent type id exists in the bundled catalog. */
export function isKnownAgentType(id) {
  return hasId(AGENT_TYPES, id)
}

/** Whether one task type id exists in the bundled catalog. */
export function isKnownTaskType(id) {
  return hasId(TASK_TYPES, id)
}
