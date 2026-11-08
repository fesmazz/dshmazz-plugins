/**
 * Host half of the Delegation Models plugin.
 *
 * V1.1 adds one persistent state document (profiles, rates, auto-configure
 * source) and same-origin routes the Web UI reads and writes:
 *
 *   GET  /dsh-delegation-models/state
 *   POST /dsh-delegation-models/profiles
 *   POST /dsh-delegation-models/rates
 *   POST /dsh-delegation-models/source
 *   POST /dsh-delegation-models/overrides
 *
 * Two model-facing tools use the same state: `delegate_model` starts a
 * continuable subagent on a routed model (named profile, agent-type/task-type
 * row, or explicit provider/model), and `set_delegation_profile` records the
 * profile a session was instructed to use. A system-prompt section publishes the
 * current policy. No credential crosses the wire.
 */

import { CATALOG } from './src/catalog.js'
import { detectTeammateRouting } from './src/capabilities.js'
import { assertAllowed, buildCatalog, normalizeConfig, resolveRoute } from './src/policy.js'
import { mergeProfileRow, normalizeProfiles, profileKey, profilesToPolicy } from './src/profiles.js'
import { buildParseMessage, extractJson, normalizeParsed, PARSE_SYSTEM } from './src/parse.js'
import { BUNDLED_RATES, validateRateCard } from './src/rates.js'
import { summarizeAgents } from './src/report.js'
import { createStateStore, defaultStateDirectory } from './src/state.js'
import { sumUsage } from './src/usage.js'
import { createSourceWatcher } from './src/watcher.js'

/** Cordis plugin name. */
export const name = 'delegation-models'

/** Tool, delegation, prompt and HTTP carrier services. */
export const inject = ['agents', 'tools', 'subagents', 'systemPrompt', 'webServer']

const DELEGATE_TOOL = 'delegate_model'
const PROFILE_TOOL = 'set_delegation_profile'
const ROUTE_PREFIX = '/dsh-delegation-models'
const BODY_LIMIT = 1_000_000

/** Per-session state: a named profile and/or row overrides, keyed by Session id. */
const sessionOverrides = new Map()

function isText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function sessionIdOf(session) {
  const id = session?.id ?? session?.header?.id
  return typeof id === 'string' ? id : undefined
}

function overridesOf(session) {
  const id = sessionIdOf(session)
  return id === undefined ? undefined : sessionOverrides.get(id)
}

/** Convert the declaration shorthand into the JSON Schema the registry accepts. */
function parametersToSchema(spec) {
  const properties = {}
  const required = []
  for (const [key, value] of Object.entries(spec)) {
    const { required: isRequired, ...rest } = value
    properties[key] = rest
    if (isRequired === true) required.push(key)
  }
  return {
    type: 'object',
    properties,
    ...(required.length === 0 ? {} : { required }),
    additionalProperties: false,
  }
}

/** Merge the persisted state over the plugin row config. */
function mergedConfig(rawConfig, state) {
  const rawProfiles = rawConfig !== null && typeof rawConfig === 'object'
    && rawConfig.profiles !== null && typeof rawConfig.profiles === 'object' && !Array.isArray(rawConfig.profiles)
    ? rawConfig.profiles
    : {}
  return normalizeConfig({
    ...(rawConfig !== null && typeof rawConfig === 'object' ? rawConfig : {}),
    profiles: { ...rawProfiles, ...profilesToPolicy(state.profiles ?? {}) },
    ...state.defaultProfile === undefined ? {} : { defaultProfile: state.defaultProfile },
    ...Array.isArray(state.allowedModels) && state.allowedModels.length > 0 ? { allowedModels: state.allowedModels } : {},
  })
}

/** Live catalog; an unusable settings row never breaks the tool. */
function catalogFor(ctx, config) {
  let settings
  try {
    const owner = ctx.get('subagentModelSelection')
    settings = owner === undefined ? undefined : owner.current()
  } catch {
    settings = undefined
  }
  let selection
  try {
    const owner = ctx.get('agentDefaultModel')
    selection = owner === undefined ? undefined : owner.currentSelection()
  } catch {
    selection = undefined
  }
  return buildCatalog(config, settings, selection)
}

/** Apply the session row overrides on top of the catalog. */
function catalogForSession(ctx, config, session) {
  const catalog = catalogFor(ctx, config)
  const rows = overridesOf(session)?.rows
  if (rows === undefined) return catalog
  for (const [key, override] of Object.entries(rows)) {
    const base = catalog.profiles[key]
    const merged = mergeProfileRow(base, override)
    if (merged === undefined) continue
    catalog.profiles[key] = {
      provider: merged.provider,
      model: merged.model,
      ...merged.reasoningEffort === undefined ? {} : { reasoningEffort: merged.reasoningEffort },
      description: base?.description ?? `${merged.agentType ?? key} · ${merged.taskType ?? ''}`,
    }
  }
  return catalog
}

function profileLines(catalog, overrides) {
  const lines = []
  for (const [profileName, profile] of Object.entries(catalog.profiles)) {
    const effort = profile.reasoningEffort === undefined ? '' : ` @ ${profile.reasoningEffort}`
    const description = profile.description === undefined ? '' : ` — ${profile.description}`
    const marker = profileName === catalog.defaultProfile ? ' (default)' : ''
    const overridden = overrides?.rows?.[profileName] === undefined ? '' : ' [session override]'
    lines.push(`- ${profileName}${marker}: ${profile.provider}/${profile.model}${effort}${description}${overridden}`)
  }
  return lines.join('\n')
}

/** Detect how this build can route teammate models. */
function teammateCapability(ctx, agent) {
  let schemas = []
  try {
    const scope = agent ?? ctx.agents.roots()[0]
    if (scope !== undefined) schemas = ctx.tools.schemas(scope)
  } catch {
    schemas = []
  }
  let modelSelection = false
  try {
    modelSelection = ctx.get('subagentModelSelection')?.current?.()?.enabled === true
  } catch {
    modelSelection = false
  }
  return detectTeammateRouting({ schemas, modelSelection })
}

/** The policy block rendered only for scopes that can see `delegate_model`. */
function promptText(ctx, config, delegateTool, context) {
  const scope = context === null || context === undefined ? undefined : context.scope
  if (ctx.tools.get(DELEGATE_TOOL, scope) !== delegateTool) return ''
  const catalog = catalogFor(ctx, config)
  if (Object.keys(catalog.profiles).length === 0) return ''
  const agent = context === null || context === undefined ? undefined : context.agent
  const overrides = agent === undefined ? undefined : overridesOf(agent.session)
  const current = overrides?.profile ?? catalog.defaultProfile
  const capability = teammateCapability(ctx, agent)
  return [
    'Delegation model policy:',
    profileLines(catalog, overrides),
    overrides?.profile === undefined ? `Current delegation default: ${current}.` : `This session was instructed to use profile "${current}" for delegations.`,
    'When the user names a model, profile, agent type or task type for a delegation, honor it: pass provider+model (and reasoning_effort when named) to `subagent`, or call `delegate_model` with the profile name or agent_type/task_type.',
    'When no model is named, call `delegate_model` with the default profile instead of letting the delegation inherit the Lead\'s route.',
    `When the user asks to use one model for all delegations in this session, call \`${PROFILE_TOOL}\` with that profile and use it for later delegations.`,
    capability.mode === 'patched'
      ? 'For a teammate delegation, pass provider, model and reasoning_effort from the matching teammate profile row to `spawn_teammate`.'
      : teammateCapability(ctx, agent).mode.startsWith('native')
        ? 'Teammates are continuable subagents with native model selection; pass the matching teammate row route through the subagent path.'
        : 'Teammate route overrides do not apply on this harness build (stock `spawn_teammate`); use `delegate_model` for model-specific work.',
    'Changing the route without naming an effort uses the selected model default.',
  ].join('\n')
}

/** Resolve one requested route from the tool arguments and the session state. */
function resolveRequestedRoute(catalog, args, sessionProfile) {
  const explicit = isText(args.provider) || isText(args.model)
  if (explicit) {
    return resolveRoute(catalog, {
      ...(isText(args.provider) ? { provider: args.provider } : {}),
      ...(isText(args.model) ? { model: args.model } : {}),
      ...(isText(args.reasoning_effort) ? { reasoning_effort: args.reasoning_effort } : {}),
    })
  }
  if (isText(args.agent_type) && isText(args.task_type)) {
    const key = profileKey(args.agent_type, args.task_type)
    if (!Object.hasOwn(catalog.profiles, key)) {
      throw new Error(`no delegation profile for "${args.agent_type}::${args.task_type}"; available rows: ${Object.keys(catalog.profiles).filter((name) => name.includes('::')).join(', ') || '(none)'}`)
    }
    return resolveRoute(catalog, {
      profile: key,
      ...(isText(args.reasoning_effort) ? { reasoning_effort: args.reasoning_effort } : {}),
    })
  }
  return resolveRoute(catalog, {
    ...(isText(args.profile) ? { profile: args.profile } : sessionProfile === undefined ? {} : { profile: sessionProfile }),
    ...(isText(args.reasoning_effort) ? { reasoning_effort: args.reasoning_effort } : {}),
  })
}

/** Build the `delegate_model` tool for the current state. */
function delegateTool(ctx, getConfig) {
  return {
    name: DELEGATE_TOOL,
    description: 'Start a continuable subagent delegation on a routed model. Use it when the user names a model, profile, agent type or task type for a delegation, or when the default (cheap) profile should apply instead of inheriting the Lead model. The child is a durable continuable subagent: the returned subagentId accepts send_message to steer it while running or continue it after it finishes. Supply profile, agent_type+task_type, or provider+model (and reasoning_effort) together.',
    parameters: parametersToSchema({
      description: { type: 'string', required: true, description: 'A short (3-5 word) description of the delegated task, for display.' },
      prompt: { type: 'string', required: true, description: 'The complete, self-contained task for the subagent.' },
      profile: { type: 'string', description: 'Delegation profile name (listed in the delegation model policy). Defaults to the session profile, then the configured default.' },
      agent_type: { type: 'string', description: 'Agent type id for a row lookup (lead, teammate, subagent, reviewer); supply with task_type.' },
      task_type: { type: 'string', description: 'Task type id for a row lookup; supply with agent_type.' },
      provider: { type: 'string', description: 'Explicit LLM provider route; supply together with model to override the profile.' },
      model: { type: 'string', description: 'Explicit model id; supply together with provider to override the profile.' },
      reasoning_effort: { type: 'string', description: 'Adapter-owned reasoning effort for the route. Omit to use the profile effort or the model default.' },
      cwd: { type: 'string', description: 'Initial child working directory; omitted inherits the parent directory.' },
    }),
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          subagentId: { type: 'string' },
          profile: { type: 'string' },
          provider: { type: 'string' },
          model: { type: 'string' },
          reasoningEffort: { type: 'string' },
        },
        required: ['subagentId', 'provider', 'model'],
      },
      render: (_args, value) => [{
        type: 'text',
        text: `started subagent ${value.subagentId} on ${value.provider}/${value.model}${value.reasoningEffort === undefined ? '' : ` @ ${value.reasoningEffort}`}`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args, exec) {
      const parent = exec.agent
      if (parent === undefined) throw new Error(`${DELEGATE_TOOL} requires a calling agent`)
      const config = getConfig()
      const catalog = catalogForSession(ctx, config, parent.session)
      const route = resolveRequestedRoute(catalog, args, overridesOf(parent.session)?.profile)
      assertAllowed(route, catalog.allowedModels)
      const llm = ctx.get('llm')
      if (llm !== undefined && typeof llm.resolveCallConfig === 'function') {
        await llm.resolveCallConfig({
          provider: route.provider,
          model: route.model,
          ...(route.reasoningEffort === undefined ? {} : { reasoningEffort: route.reasoningEffort }),
        }, exec.signal)
      }
      const backend = config.provider
      const providers = ctx.subagents.list?.()
      if (Array.isArray(providers) && !providers.includes(backend)) {
        throw new Error(`subagent provider "${backend}" is not registered; available providers: ${providers.join(', ') || '(none)'}`)
      }
      const activation = await ctx.subagents.startActivation({
        provider: backend,
        label: String(args.description),
        request: {
          prompt: [{ type: 'text', text: String(args.prompt) }],
          parent,
          ...(isText(args.cwd) ? { cwd: args.cwd } : {}),
          agentOptions: {
            provider: route.provider,
            model: route.model,
            ...(route.reasoningEffort === undefined ? {} : { reasoningEffort: route.reasoningEffort }),
          },
        },
        signal: exec.signal,
        delivery: 'parent',
      })
      return {
        subagentId: activation.childId,
        provider: route.provider,
        model: route.model,
        ...(route.profile === undefined ? {} : { profile: route.profile }),
        ...(route.reasoningEffort === undefined ? {} : { reasoningEffort: route.reasoningEffort }),
      }
    },
  }
}

/** Build the `set_delegation_profile` tool for the current state. */
function profileTool(ctx, getConfig) {
  return {
    name: PROFILE_TOOL,
    description: 'Record the delegation model profile for the rest of this session, or clear it. Use it when the user asks that subsequent delegations use a specific model or profile.',
    parameters: parametersToSchema({
      profile: { type: 'string', description: 'Profile name to apply to later delegations in this session.' },
      clear: { type: 'boolean', description: 'Set true to remove the session profile instead.' },
    }),
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: { profile: { type: 'string' }, cleared: { type: 'boolean' } },
      },
      render: (_args, value) => [{
        type: 'text',
        text: value.cleared === true ? 'cleared the session delegation profile' : `session delegation profile set to ${value.profile}`,
      }],
    },
    async execute(args, exec) {
      const parent = exec.agent
      if (parent === undefined) throw new Error(`${PROFILE_TOOL} requires a calling agent`)
      const id = sessionIdOf(parent.session)
      if (id === undefined) throw new Error(`${PROFILE_TOOL} requires a Session identity`)
      const existing = sessionOverrides.get(id) ?? { rows: {} }
      if (args.clear === true) {
        sessionOverrides.set(id, { ...existing, profile: undefined })
        return { cleared: true }
      }
      const catalog = catalogFor(ctx, getConfig())
      const name = isText(args.profile) ? args.profile : catalog.defaultProfile
      if (name === undefined) throw new Error('no delegation profile is configured')
      if (!Object.hasOwn(catalog.profiles, name)) {
        throw new Error(`unknown delegation profile "${name}"; available profiles: ${Object.keys(catalog.profiles).join(', ') || '(none)'}`)
      }
      sessionOverrides.set(id, { ...existing, profile: name })
      return { profile: name }
    },
  }
}

function writeJson(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(JSON.stringify(body))
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > BODY_LIMIT) {
        reject(new Error('request body too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8')
        resolve(text.length === 0 ? {} : JSON.parse(text))
      } catch {
        reject(new Error('invalid JSON body'))
      }
    })
    req.on('error', reject)
  })
}

function normalizeAllowedModels(value) {
  if (!Array.isArray(value)) return []
  return value
    .filter((entry) => entry !== null && typeof entry === 'object'
      && isText(entry.provider) && isText(entry.model))
    .map((entry) => ({ provider: entry.provider, model: entry.model }))
}

function normalizeSource(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return undefined
  if (value.kind !== 'file' && value.kind !== 'paste') return undefined
  return {
    kind: value.kind,
    ...isText(value.path) ? { path: value.path } : {},
    ...typeof value.text === 'string' ? { text: value.text } : {},
    ...typeof value.autoApply === 'boolean' ? { autoApply: value.autoApply } : {},
  }
}

/** Unique exact routes the client may offer for overrides. */
function availableModels(state) {
  const seen = new Set()
  const list = []
  const add = (provider, model) => {
    if (!isText(provider) || !isText(model)) return
    const key = `${provider}\u0000${model}`
    if (seen.has(key)) return
    seen.add(key)
    list.push({ provider, model })
  }
  for (const rate of state.rates?.models ?? []) add(rate.provider, rate.model)
  for (const row of Object.values(state.profiles ?? {})) add(row.provider, row.model)
  for (const route of state.allowedModels ?? []) add(route.provider, route.model)
  return list
}

/** Committed events of one live Session, or an empty list when unreadable. */
function eventsOf(session) {
  try {
    return typeof session?.snapshotEvents === 'function' ? session.snapshotEvents() : []
  } catch {
    return []
  }
}

/** The route an agent currently runs on. */
function routeOf(agent) {
  const options = agent?.options
  if (options !== undefined && isText(options.provider) && isText(options.model)) {
    return { provider: options.provider, model: options.model }
  }
  try {
    const request = agent?.session?.requestContext?.()
    if (request !== undefined && isText(request.provider) && isText(request.model)) {
      return { provider: request.provider, model: request.model }
    }
  } catch {
    // Fall through to an unknown route.
  }
  return {}
}

/** Role and display name for one live agent. */
function identityOf(ctx, agent, root) {
  if (String(agent.id) === String(root.id)) return { role: 'lead', name: 'lead' }
  try {
    const membership = ctx.get('agentTeams')?.membership?.(agent)
    if (membership !== undefined) return { role: membership.role, name: membership.name ?? String(agent.id) }
  } catch {
    // Not a Team member.
  }
  const title = agent?.session?.header?.title
  return { role: 'subagent', name: isText(title) ? title : String(agent.id) }
}

/** Live agents under one root, including the root. */
function agentsUnder(ctx, root) {
  const rootId = String(root.id)
  const list = []
  for (const agent of ctx.agents.list()) {
    let current = agent
    let depth = 0
    let under = false
    while (current !== undefined && depth < 12) {
      if (String(current.id) === rootId) { under = true; break }
      const parentId = current.session?.header?.parentSession
      if (parentId === undefined) break
      current = ctx.agents.get(parentId)
      depth += 1
    }
    if (under) list.push(agent)
  }
  return list
}

/** Balance from the Token & Balance plugin route, cached briefly. */
let balanceCache = { at: 0, value: null }
async function tokenBalance(ctx, sessionId) {
  const now = Date.now()
  if (balanceCache.at !== 0 && now - balanceCache.at < 30_000) return balanceCache.value
  try {
    const origin = ctx.webServer.getOrigin()
    const query = sessionId === undefined ? '' : `?sessionId=${encodeURIComponent(sessionId)}`
    const response = await fetch(`${origin}/dsh-token-balance${query}`, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(4_000),
    })
    if (!response.ok) return null
    const value = await response.json()
    balanceCache = { at: now, value }
    return value
  } catch {
    return null
  }
}

/** The route used to parse rules: the default row, the first row, then the Lead default. */
function parseRouteFor(ctx, state) {
  const defaultRow = state.defaultProfile === undefined ? undefined : state.profiles?.[state.defaultProfile]
  const first = defaultRow ?? Object.values(state.profiles ?? {})[0]
  if (first !== undefined && isText(first.provider) && isText(first.model)) {
    return {
      provider: first.provider,
      model: first.model,
      ...isText(first.reasoningEffort) ? { reasoningEffort: first.reasoningEffort } : {},
    }
  }
  try {
    const current = ctx.get('agentDefaultModel')?.currentSelection?.()
    if (current !== undefined && isText(current.provider) && isText(current.model)) {
      return {
        provider: current.provider,
        model: current.model,
        ...typeof current.reasoningEffort === 'string' ? { reasoningEffort: current.reasoningEffort } : {},
      }
    }
  } catch {
    // No default selection is available.
  }
  return undefined
}

/** Ask the configured model to convert rules into profile rows. */
async function parseRules(ctx, state, text, signal) {
  const route = parseRouteFor(ctx, state)
  if (route === undefined) throw new Error('no model route is configured for parsing; add a profile or a default model')
  const llm = ctx.get('llm')
  if (llm === undefined) throw new Error('the llm service is not available')
  const prepared = await llm.prepareCall({
    provider: route.provider,
    model: route.model,
    ...route.reasoningEffort === undefined ? {} : { reasoningEffort: route.reasoningEffort },
    maxTokens: 2000,
  }, signal)
  const chunks = prepared.stream({
    ...prepared.config,
    system: PARSE_SYSTEM,
    messages: [{ role: 'user', content: [{ type: 'text', text: buildParseMessage(text) }] }],
    signal,
  })
  let reply = ''
  for await (const chunk of chunks) {
    if (chunk.type === 'text-delta') reply += chunk.text
    if (chunk.type === 'finish' && chunk.reason?.kind === 'error') {
      throw new Error(chunk.reason.failure?.message ?? 'the model call failed')
    }
  }
  return { ...normalizeParsed(extractJson(reply)), route }
}

export function apply(ctx, rawConfig) {
  const store = createStateStore(defaultStateDirectory())
  let state = store.read()
  const getConfig = () => mergedConfig(rawConfig, state)
  const delegate = delegateTool(ctx, getConfig)
  const profile = profileTool(ctx, getConfig)

  const watcher = createSourceWatcher({
    onChange: async (text) => {
      try {
        const result = await parseRules(ctx, state, text, AbortSignal.timeout(90_000))
        if (!result.ok) {
          state = store.write({ source: { ...state.source, lastError: result.errors.join('; ') } })
          return
        }
        state = store.write({
          profiles: result.profiles,
          source: { ...state.source, text, appliedAt: new Date().toISOString(), lastError: undefined },
        })
      } catch (error) {
        state = store.write({
          source: { ...state.source, lastError: error instanceof Error ? error.message : String(error) },
        })
      }
    },
  })
  const armWatcher = () => {
    const source = state.source
    if (source !== null && source !== undefined && source.kind === 'file' && isText(source.path) && source.autoApply === true) {
      watcher.start(source.path)
    } else {
      watcher.stop()
    }
  }
  armWatcher()
  ctx.effect(() => () => watcher.stop(), 'delegation-models: source watcher')

  ctx.effect(() => ctx.tools.register(delegate), 'delegation-models: delegate tool')
  ctx.effect(() => ctx.tools.register(profile), 'delegation-models: profile tool')
  ctx.effect(
    () => ctx.systemPrompt.section({
      name: 'delegation:models',
      order: ctx.systemPrompt.getSectionOrder('TOOL_SUBAGENT'),
      text: (context) => promptText(ctx, getConfig(), delegate, context),
    }),
    'delegation-models: prompt',
  )

  const routes = [
    {
      method: 'GET',
      path: `${ROUTE_PREFIX}/state`,
      handler: async (req, res) => {
        const url = new URL(req.url ?? '/', 'http://local')
        const sessionId = url.searchParams.get('sessionId') ?? undefined
        writeJson(res, 200, {
          ok: true,
          catalog: CATALOG,
          state: {
            profiles: state.profiles,
            defaultProfile: state.defaultProfile,
            allowedModels: state.allowedModels,
            rates: state.rates,
            source: state.source,
          },
          availableModels: availableModels(state),
          bundledRates: BUNDLED_RATES,
          teammates: teammateCapability(ctx),
          overrides: sessionId === undefined ? null : sessionOverrides.get(sessionId) ?? null,
          policy: profilesToPolicy(state.profiles),
        })
      },
    },
    {
      method: 'POST',
      path: `${ROUTE_PREFIX}/profiles`,
      handler: async (req, res) => {
        const body = await readJson(req)
        const result = normalizeProfiles(body.profiles)
        if (!result.ok) {
          writeJson(res, 400, { ok: false, errors: result.errors })
          return
        }
        const defaultProfile = isText(body.defaultProfile) ? body.defaultProfile : undefined
        if (defaultProfile !== undefined && !Object.hasOwn(result.profiles, defaultProfile)) {
          writeJson(res, 400, { ok: false, errors: [`defaultProfile "${defaultProfile}" is not a profile row`] })
          return
        }
        state = store.write({
          profiles: result.profiles,
          defaultProfile,
          allowedModels: normalizeAllowedModels(body.allowedModels),
        })
        writeJson(res, 200, { ok: true, state: { profiles: state.profiles, defaultProfile: state.defaultProfile } })
      },
    },
    {
      method: 'POST',
      path: `${ROUTE_PREFIX}/rates`,
      handler: async (req, res) => {
        const body = await readJson(req)
        const result = validateRateCard(body.rates)
        if (!result.ok) {
          writeJson(res, 400, { ok: false, errors: result.errors })
          return
        }
        state = store.write({ rates: result.card })
        writeJson(res, 200, { ok: true, rates: state.rates })
      },
    },
    {
      method: 'POST',
      path: `${ROUTE_PREFIX}/source`,
      handler: async (req, res) => {
        const body = await readJson(req)
        const source = normalizeSource(body.source)
        if (source === undefined) {
          writeJson(res, 400, { ok: false, errors: ['source must be { kind: "file"|"paste", path?, text?, autoApply? }'] })
          return
        }
        state = store.write({ source })
        armWatcher()
        writeJson(res, 200, { ok: true, source: state.source })
      },
    },
    {
      method: 'GET',
      path: `${ROUTE_PREFIX}/usage`,
      handler: async (req, res) => {
        const url = new URL(req.url ?? '/', 'http://local')
        const requested = url.searchParams.get('sessionId') ?? undefined
        const root = requested === undefined ? ctx.agents.roots()[0] : ctx.agents.get(requested)
        if (root === undefined) {
          writeJson(res, 404, { ok: false, errors: ['no live Session for the requested id'] })
          return
        }
        const agents = agentsUnder(ctx, root).map((agent) => {
          const identity = identityOf(ctx, agent, root)
          const route = routeOf(agent)
          return {
            id: String(agent.id),
            name: identity.name,
            role: identity.role,
            provider: route.provider,
            model: route.model,
            usage: sumUsage(eventsOf(agent.session)),
          }
        })
        const report = summarizeAgents(agents, state.rates)
        const token = await tokenBalance(ctx, String(root.id))
        writeJson(res, 200, {
          ok: true,
          sessionId: String(root.id),
          currency: state.rates.currency,
          balance: token?.balance ?? null,
          ...report,
        })
      },
    },
    {
      method: 'POST',
      path: `${ROUTE_PREFIX}/parse`,
      handler: async (req, res) => {
        const body = await readJson(req)
        const text = isText(body.text) ? body.text : state.source?.text
        if (!isText(text)) {
          writeJson(res, 400, { ok: false, errors: ['text is required (or save a source first)'] })
          return
        }
        try {
          const result = await parseRules(ctx, state, text, AbortSignal.timeout(60_000))
          if (!result.ok) {
            writeJson(res, 422, { ok: false, errors: result.errors })
            return
          }
          writeJson(res, 200, { ok: true, route: result.route, profiles: result.profiles })
        } catch (error) {
          writeJson(res, 502, { ok: false, errors: [error instanceof Error ? error.message : String(error)] })
        }
      },
    },
    {
      method: 'POST',
      path: `${ROUTE_PREFIX}/overrides`,
      handler: async (req, res) => {
        const body = await readJson(req)
        if (!isText(body.sessionId)) {
          writeJson(res, 400, { ok: false, errors: ['sessionId is required'] })
          return
        }
        const existing = sessionOverrides.get(body.sessionId) ?? { rows: {} }
        const rows = body.rows !== null && typeof body.rows === 'object' && !Array.isArray(body.rows) ? body.rows : existing.rows
        sessionOverrides.set(body.sessionId, {
          profile: isText(body.profile) ? body.profile : existing.profile,
          rows,
        })
        writeJson(res, 200, { ok: true, overrides: sessionOverrides.get(body.sessionId) })
      },
    },
  ]

  for (const route of routes) {
    ctx.effect(
      () => ctx.webServer.register({
        kind: 'exact',
        path: route.path,
        handler: async (req, res) => {
          if (req.method !== route.method) {
            writeJson(res, 405, { ok: false, errors: [`method ${String(req.method)} is not allowed`] })
            return
          }
          try {
            await route.handler(req, res)
          } catch (error) {
            writeJson(res, 500, { ok: false, errors: [error instanceof Error ? error.message : String(error)] })
          }
        },
      }),
      `delegation-models: route ${route.path}`,
    )
  }
}
