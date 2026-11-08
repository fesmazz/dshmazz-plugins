/**
 * Delegation Models: model-aware subagent delegation.
 *
 * Registers two model-facing tools:
 * - `delegate_model` starts a continuable subagent on a routed model, resolved
 *   from a named profile or explicit provider/model, and returns its id.
 * - `set_delegation_profile` records the profile this session was instructed to
 *   use for later delegations.
 *
 * A system-prompt section tells every agent the current profiles, the session
 * override and how delegation model instructions are honored. Teammates started
 * with `spawn_teammate` inherit the Lead model (the Team tool takes no model
 * argument), so model-specific work is delegated through `delegate_model`
 * instead.
 */

import { assertAllowed, buildCatalog, normalizeConfig, resolveRoute } from './src/policy.js'

/** Cordis plugin name. */
export const name = 'delegation-models'

/** The tool registry, delegation runtime and prompt registry are required. */
export const inject = ['tools', 'subagents', 'systemPrompt']

const DELEGATE_TOOL = 'delegate_model'
const PROFILE_TOOL = 'set_delegation_profile'

/** Session-scoped profile overrides recorded by `set_delegation_profile`. */
const overrides = new WeakMap()

function isText(value) {
  return typeof value === 'string' && value.trim().length > 0
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

function profileLines(catalog) {
  const lines = []
  for (const [profileName, profile] of Object.entries(catalog.profiles)) {
    const effort = profile.reasoningEffort === undefined ? '' : ` @ ${profile.reasoningEffort}`
    const description = profile.description === undefined ? '' : ` — ${profile.description}`
    const marker = profileName === catalog.defaultProfile ? ' (default)' : ''
    lines.push(`- ${profileName}${marker}: ${profile.provider}/${profile.model}${effort}${description}`)
  }
  return lines.join('\n')
}

/** The policy block rendered only for scopes that can see `delegate_model`. */
function promptText(ctx, config, delegateTool, context) {
  const scope = context === null || context === undefined ? undefined : context.scope
  if (ctx.tools.get(DELEGATE_TOOL, scope) !== delegateTool) return ''
  const catalog = catalogFor(ctx, config)
  if (Object.keys(catalog.profiles).length === 0) return ''
  const agent = context === null || context === undefined ? undefined : context.agent
  const session = agent === undefined ? undefined : agent.session
  const override = session === undefined ? undefined : overrides.get(session)
  const current = override === undefined ? catalog.defaultProfile : override
  return [
    'Delegation model policy:',
    profileLines(catalog),
    override === undefined ? `Current delegation default: ${current}.` : `This session was instructed to use profile "${current}" for delegations.`,
    `When the user names a model or profile for a delegation, honor it: pass provider+model (and reasoning_effort when named) to \`subagent\`, or call \`${DELEGATE_TOOL}\` with the profile name.`,
    `When no model is named, call \`${DELEGATE_TOOL}\` with the default profile instead of letting the delegation inherit the Lead's route.`,
    `When the user asks to use one model for all delegations in this session, call \`${PROFILE_TOOL}\` with that profile and use it for later delegations.`,
    'Teammates started with `spawn_teammate` inherit the Lead model and take no model argument; when a delegation must use another model, use `delegate_model` instead of a teammate.',
    'Changing the route without naming an effort uses the selected model default.',
  ].join('\n')
}

/** Build the `delegate_model` tool for the current config. */
function delegateTool(ctx, config) {
  return {
    name: DELEGATE_TOOL,
    description: 'Start a continuable subagent delegation on a routed model. Use this when the user names a model or profile for a delegation, or when the default (cheap) profile should apply instead of inheriting the Lead model. The child is a durable continuable subagent: the returned subagentId accepts send_message to steer it while running or continue it after it finishes. Supply profile, or provider+model (and reasoning_effort) together.',
    parameters: parametersToSchema({
      description: {
        type: 'string',
        required: true,
        description: 'A short (3-5 word) description of the delegated task, for display.',
      },
      prompt: {
        type: 'string',
        required: true,
        description: 'The complete, self-contained task for the subagent.',
      },
      profile: {
        type: 'string',
        description: 'Delegation profile name (listed in the delegation model policy). Defaults to the session profile, then the configured default.',
      },
      provider: {
        type: 'string',
        description: 'Explicit LLM provider route; supply together with model to override the profile.',
      },
      model: {
        type: 'string',
        description: 'Explicit model id; supply together with provider to override the profile.',
      },
      reasoning_effort: {
        type: 'string',
        description: 'Adapter-owned reasoning effort for the route. Omit to use the profile effort or the model default.',
      },
      cwd: {
        type: 'string',
        description: 'Initial child working directory; omitted inherits the parent directory.',
      },
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
      const catalog = catalogFor(ctx, config)
      const sessionProfile = overrides.get(parent.session)
      const route = resolveRoute(catalog, {
        ...(isText(args.profile) ? { profile: args.profile } : sessionProfile === undefined ? {} : { profile: sessionProfile }),
        ...(isText(args.provider) ? { provider: args.provider } : {}),
        ...(isText(args.model) ? { model: args.model } : {}),
        ...(isText(args.reasoning_effort) ? { reasoning_effort: args.reasoning_effort } : {}),
      })
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

/** Build the `set_delegation_profile` tool for the current config. */
function profileTool(ctx, config) {
  return {
    name: PROFILE_TOOL,
    description: 'Record the delegation model profile for the rest of this session, or clear it. Use it when the user asks that subsequent delegations use a specific model or profile.',
    parameters: parametersToSchema({
      profile: {
        type: 'string',
        description: 'Profile name to apply to later delegations in this session.',
      },
      clear: {
        type: 'boolean',
        description: 'Set true to remove the session profile instead.',
      },
    }),
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          profile: { type: 'string' },
          cleared: { type: 'boolean' },
        },
      },
      render: (_args, value) => [{
        type: 'text',
        text: value.cleared === true ? 'cleared the session delegation profile' : `session delegation profile set to ${value.profile}`,
      }],
    },
    async execute(args, exec) {
      const parent = exec.agent
      if (parent === undefined) throw new Error(`${PROFILE_TOOL} requires a calling agent`)
      if (args.clear === true) {
        overrides.delete(parent.session)
        return { cleared: true }
      }
      const catalog = catalogFor(ctx, config)
      const name = isText(args.profile) ? args.profile : catalog.defaultProfile
      if (name === undefined) throw new Error('no delegation profile is configured')
      if (!Object.hasOwn(catalog.profiles, name)) {
        throw new Error(`unknown delegation profile "${name}"; available profiles: ${Object.keys(catalog.profiles).join(', ') || '(none)'}`)
      }
      overrides.set(parent.session, name)
      return { profile: name }
    },
  }
}

export function apply(ctx, rawConfig) {
  const config = normalizeConfig(rawConfig)
  const delegate = delegateTool(ctx, config)
  const profile = profileTool(ctx, config)
  ctx.effect(() => ctx.tools.register(delegate), 'delegation-models: delegate tool')
  ctx.effect(() => ctx.tools.register(profile), 'delegation-models: profile tool')
  ctx.effect(
    () => ctx.systemPrompt.section({
      name: 'delegation:models',
      order: ctx.systemPrompt.getSectionOrder('TOOL_SUBAGENT'),
      text: (context) => promptText(ctx, config, delegate, context),
    }),
    'delegation-models: prompt',
  )
}
