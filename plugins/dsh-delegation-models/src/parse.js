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
  'Output ONLY a JSON object with a "profiles" array. No prose, no code fences, no explanation.',
  'Start the reply with { and end it with }.',
  'Each profile is {"agent_type","task_type","tier","provider","model","reasoning_effort"}.',
  'agent_type is one of: lead, teammate, subagent, reviewer.',
  'task_type is one of: orchestration, planning, implementation, review, security-review, verification, extraction, cleanup.',
  'tier is one of: light, capable, premium.',
  'provider and model are the exact route named by the rules; omit reasoning_effort when unknown.',
  'If a rule names a role group rather than one agent type, choose the closest agent type and keep one row per task class.',
].join(' ')

/** System instruction for the JSON-repair turn. */
export const REPAIR_SYSTEM = 'You reformat a model reply as strict JSON. Output only the JSON value, starting with { or [ and ending with } or ]. No prose and no code fences.'

/**
 * Build the parser request text.
 * @param text - user-provided rules, already truncated by the caller.
 * @returns the user message content.
 */
export function buildParseMessage(text) {
  return `Rules:\n${String(text).slice(0, 20_000)}`
}

/**
 * Build the repair request text from a reply that was not JSON.
 * @param reply - the previous assistant text.
 * @returns the user message content.
 */
export function buildRepairMessage(reply) {
  return `Convert this into the required JSON: {"profiles":[{"agent_type","task_type","tier","provider","model","reasoning_effort"}]}. Output only the JSON value.\n\n${String(reply).slice(0, 12_000)}`
}

/**
 * Extract a JSON value from a model reply.
 *
 * Handles reasoning tags, code fences (named or bare), surrounding prose, and
 * both object and array roots. Every candidate is tried before failing.
 * @param reply - raw assistant text.
 * @returns the parsed value.
 * @throws when no JSON value is present.
 */
export function extractJson(reply) {
  const text = String(reply).replace(/<think[\s\S]*?<\/think>/gi, '').trim()
  const candidates = []
  for (const match of text.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)) candidates.push(match[1])
  candidates.push(text)
  for (const candidate of candidates) {
    for (let index = 0; index < candidate.length; index += 1) {
      const character = candidate[index]
      if (character !== '{' && character !== '[') continue
      const close = character === '{' ? '}' : ']'
      const end = candidate.lastIndexOf(close)
      if (end <= index) continue
      try {
        return JSON.parse(candidate.slice(index, end + 1))
      } catch {
        // Try the next opening character.
      }
    }
  }
  throw new Error('the model reply did not contain a JSON object or array')
}

function text(value) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
}

/**
 * Normalize a parsed reply into profile rows.
 *
 * Accepts the requested `{ profiles: [...] }`, a bare row array, a keyed
 * `{ "agent::task": {...} }` map, a single row object, and common aliases
 * (`rows`, `rules`, `role`, `task`, `route`). Missing tiers default to
 * `capable`; a combined `provider/model` value is split.
 * @param value - parsed JSON.
 * @returns `{ ok, errors, profiles }` where profiles are keyed by agentType::taskType.
 */
export function normalizeParsed(value) {
  let list
  if (Array.isArray(value)) list = value
  else if (value !== null && typeof value === 'object') {
    if (Array.isArray(value.profiles)) list = value.profiles
    else if (value.profiles !== null && typeof value.profiles === 'object') list = Object.values(value.profiles)
    else if (Array.isArray(value.rows)) list = value.rows
    else if (Array.isArray(value.rules)) list = value.rules
    else if (text(value.agent_type) !== undefined || text(value.agentType) !== undefined) list = [value]
    else {
      const keyed = Object.entries(value).filter(([key]) => key.includes('::'))
      if (keyed.length > 0) {
        list = keyed.map(([key, row]) => {
          const [agentType, taskType] = key.split('::')
          return row !== null && typeof row === 'object' ? { ...row, agent_type: agentType, task_type: taskType } : {}
        })
      }
    }
  }
  if (!Array.isArray(list)) {
    return { ok: false, errors: [`the reply must contain a "profiles" array; got ${JSON.stringify(value).slice(0, 160)}`], profiles: {} }
  }
  const rows = {}
  for (const entry of list) {
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) continue
    const agentType = text(entry.agent_type) ?? text(entry.agentType) ?? text(entry.agent) ?? text(entry.role)
    const taskType = text(entry.task_type) ?? text(entry.taskType) ?? text(entry.task)
    if (agentType === undefined || taskType === undefined) continue
    const route = text(entry.route)
    const slash = route === undefined ? -1 : route.indexOf('/')
    const provider = text(entry.provider) ?? (slash > 0 ? route.slice(0, slash) : undefined)
    let model = text(entry.model) ?? (slash > 0 ? route.slice(slash + 1) : undefined)
    let routeProvider = provider
    if (model !== undefined && model.includes('/') && routeProvider === undefined) {
      const modelSlash = model.indexOf('/')
      routeProvider = model.slice(0, modelSlash)
      model = model.slice(modelSlash + 1)
    }
    rows[`${agentType}::${taskType}`] = {
      tier: text(entry.tier) ?? 'capable',
      provider: routeProvider === 'deepseek' ? 'deepseek-account' : routeProvider,
      model: model === 'flash' ? 'deepseek-flash' : model === 'v4-pro' ? 'deepseek-v4-pro' : model,
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

/**
 * Pick the cheapest suitable route for the parsing turn.
 *
 * Parsing is mechanical: prefer a `light` row, then a flash model, then the
 * caller's ordered rows; force a low reasoning effort so a reasoning model does
 * not spend the whole token budget before emitting JSON.
 * @param rows - candidate rows in preference order (default row first).
 * @param selection - Lead's current model selection as a fallback.
 * @returns `{ provider, model, reasoningEffort }`, or undefined.
 */
export function pickParseRoute(rows, selection) {
  const list = Array.isArray(rows) ? rows.filter((row) => row !== null && typeof row === 'object') : []
  const light = list.find((row) => row.tier === 'light') ?? list.find((row) => String(row.model).includes('flash'))
  const row = light ?? list[0]
  if (row !== undefined && text(row.provider) !== undefined && text(row.model) !== undefined) {
    return { provider: text(row.provider), model: text(row.model), reasoningEffort: text(row.reasoningEffort) ?? 'low' }
  }
  if (selection !== undefined && text(selection.provider) !== undefined && text(selection.model) !== undefined) {
    return { provider: text(selection.provider), model: text(selection.model), reasoningEffort: 'low' }
  }
  return undefined
}
