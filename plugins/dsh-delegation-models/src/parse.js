/**
 * Auto-configure parsing helpers.
 *
 * The host asks the configured model for strict JSON, then this module extracts
 * and normalizes the reply into profile rows. Pure and testable: no network.
 */

import { normalizeProfiles } from './profiles.js'

/** System instruction for the parser model. */
export const PARSE_SYSTEM = [
  'You convert model-routing rules into strict JSON.',
  'Output ONLY a JSON object with a "profiles" array. No prose and no code fences.',
  'Each profile is {"agent_type","task_type","tier","provider","model","reasoning_effort"}.',
  'agent_type is one of: lead, teammate, subagent, reviewer.',
  'task_type is one of: orchestration, planning, implementation, review, security-review, verification, extraction, cleanup.',
  'tier is one of: light, capable, premium.',
  'provider and model are the exact route named by the rules; omit reasoning_effort when unknown.',
  'If a rule names a role group rather than one agent type, choose the closest agent type and keep one row per task class.',
].join(' ')

/**
 * Build the parser request text.
 * @param text - user-provided rules, already truncated by the caller.
 * @returns the user message content.
 */
export function buildParseMessage(text) {
  return `Rules:\n${String(text).slice(0, 20_000)}`
}

/**
 * Extract a JSON value from a model reply that may be fenced.
 * @param reply - raw assistant text.
 * @returns the parsed value.
 * @throws when no JSON object is present.
 */
export function extractJson(reply) {
  const text = String(reply).trim()
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced === null ? text : fenced[1]
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start < 0 || end <= start) throw new Error('the model reply did not contain a JSON object')
  return JSON.parse(candidate.slice(start, end + 1))
}

function text(value) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
}

/**
 * Normalize a parsed reply into profile rows.
 * @param value - parsed JSON, `{ profiles: [...] }` or a bare array.
 * @returns `{ ok, errors, profiles }` where profiles are keyed by agentType::taskType.
 */
export function normalizeParsed(value) {
  const list = Array.isArray(value) ? value : value?.profiles
  if (!Array.isArray(list)) return { ok: false, errors: ['the reply must contain a "profiles" array'], profiles: {} }
  const rows = {}
  for (const entry of list) {
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) continue
    const agentType = text(entry.agent_type) ?? text(entry.agentType)
    const taskType = text(entry.task_type) ?? text(entry.taskType)
    if (agentType === undefined || taskType === undefined) continue
    rows[`${agentType}::${taskType}`] = {
      tier: text(entry.tier),
      provider: text(entry.provider),
      model: text(entry.model),
      ...text(entry.reasoning_effort) === undefined && text(entry.reasoningEffort) === undefined
        ? {}
        : { reasoningEffort: text(entry.reasoning_effort) ?? text(entry.reasoningEffort) },
    }
  }
  if (Object.keys(rows).length === 0) return { ok: false, errors: ['no usable profile rows in the reply'], profiles: {} }
  const normalized = normalizeProfiles(rows)
  if (!normalized.ok) return { ok: false, errors: normalized.errors, profiles: {} }
  return { ok: true, errors: [], profiles: normalized.profiles }
}
