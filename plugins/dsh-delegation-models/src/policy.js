/**
 * Pure delegation-routing policy.
 *
 * Two layers decide a child route:
 *
 * - `normalizeConfig` reads the plugin row's raw config (profiles, default
 *   profile, explicit allowlist, subagent backend).
 * - `buildCatalog` derives a usable profile catalog when no profiles are
 *   configured, from the live `subagentModelSelection` allowed routes or the
 *   Lead's current default selection, so the plugin works out of the box.
 * - `resolveRoute` applies model-facing request fields over those profiles and
 *   `assertAllowed` enforces an explicit allowlist.
 */

function isText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

/** Normalize one `{ provider, model }` route, or undefined when malformed. */
export function normalizeRoute(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return undefined
  if (!isText(value.provider) || !isText(value.model)) return undefined
  return { provider: value.provider, model: value.model }
}

/** Normalize the raw plugin config into the policy shape. */
export function normalizeConfig(raw) {
  const config = raw !== null && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
  const profiles = {}
  const configuredProfiles = config.profiles !== null && typeof config.profiles === 'object' && !Array.isArray(config.profiles)
    ? config.profiles
    : {}
  for (const [profileName, value] of Object.entries(configuredProfiles)) {
    const route = normalizeRoute(value)
    if (route === undefined || !isText(profileName)) continue
    profiles[profileName] = {
      ...route,
      ...(isText(value.reasoningEffort) ? { reasoningEffort: value.reasoningEffort } : {}),
      ...(isText(value.description) ? { description: value.description } : {}),
    }
  }
  const allowedModels = Array.isArray(config.allowedModels)
    ? config.allowedModels.map(normalizeRoute).filter((route) => route !== undefined)
    : []
  return {
    provider: isText(config.provider) ? config.provider : 'spawn',
    profiles,
    defaultProfile: isText(config.defaultProfile) ? config.defaultProfile : undefined,
    allowedModels,
  }
}

/** Derive a stable profile name from a model id without colliding. */
function profileNameFor(route, taken) {
  const base = route.model
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '') || 'route'
  let name = base
  let counter = 2
  while (Object.hasOwn(taken, name)) {
    name = `${base}-${counter}`
    counter += 1
  }
  return name
}

/**
 * Build the usable catalog.
 * @param config - output of {@link normalizeConfig}.
 * @param settings - live `subagentModelSelection.current()`, if available.
 * @param selection - live `agentDefaultModel.currentSelection()`, if available.
 * @returns profiles, default profile name, and the explicit-route allowlist.
 */
export function buildCatalog(config, settings, selection) {
  const profiles = { ...config.profiles }
  const enabled = settings !== null && typeof settings === 'object' && settings.enabled === true
  const allowed = enabled && Array.isArray(settings.allowedModels) ? settings.allowedModels : []
  let defaultProfile = config.defaultProfile

  if (Object.keys(profiles).length === 0) {
    const routes = []
    for (const candidate of allowed) {
      const route = normalizeRoute(candidate)
      if (route !== undefined) routes.push(route)
    }
    if (routes.length === 0) for (const route of config.allowedModels) routes.push(route)
    if (routes.length === 0) {
      const route = normalizeRoute(selection)
      if (route !== undefined) routes.push(route)
    }
    for (const route of routes) profiles[profileNameFor(route, profiles)] = { ...route }
  }

  if (defaultProfile === undefined && Object.keys(profiles).length > 0) defaultProfile = Object.keys(profiles)[0]
  if (defaultProfile !== undefined && !Object.hasOwn(profiles, defaultProfile)) defaultProfile = Object.keys(profiles)[0]

  return { profiles, defaultProfile, allowedModels: allowedRoutes(config, settings) }
}

/** The explicit-route allowlist in force, if any. */
export function allowedRoutes(config, settings) {
  if (config.allowedModels.length > 0) return config.allowedModels.map((route) => ({ ...route }))
  if (settings !== null && typeof settings === 'object' && settings.enabled === true && Array.isArray(settings.allowedModels)) {
    return settings.allowedModels.map(normalizeRoute).filter((route) => route !== undefined)
  }
  return []
}

/**
 * Resolve one child route from model-facing request fields.
 * Explicit `provider`+`model` win over profile selection; otherwise the named
 * profile, then the default profile applies. A profile's effort is kept unless
 * the request names one; an explicit route takes only the named effort.
 */
export function resolveRoute(catalog, request) {
  const explicitProvider = isText(request.provider) ? request.provider : undefined
  const explicitModel = isText(request.model) ? request.model : undefined
  const effort = isText(request.reasoning_effort) ? request.reasoning_effort : undefined

  if ((explicitProvider === undefined) !== (explicitModel === undefined)) {
    throw new Error('`provider` and `model` must be supplied together')
  }
  if (explicitProvider !== undefined) {
    return {
      provider: explicitProvider,
      model: explicitModel,
      ...(effort === undefined ? {} : { reasoningEffort: effort }),
    }
  }

  const name = isText(request.profile) ? request.profile : catalog.defaultProfile
  if (name === undefined) throw new Error('no delegation profile is configured; supply provider+model or configure profiles')
  const profile = catalog.profiles[name]
  if (profile === undefined) {
    throw new Error(`unknown delegation profile "${name}"; available profiles: ${Object.keys(catalog.profiles).join(', ') || '(none)'}`)
  }
  const chosenEffort = effort === undefined ? profile.reasoningEffort : effort
  return {
    provider: profile.provider,
    model: profile.model,
    ...(chosenEffort === undefined ? {} : { reasoningEffort: chosenEffort }),
    profile: name,
  }
}

/** Reject an explicit route outside the allowlist; an empty allowlist permits all. */
export function assertAllowed(route, allowedModels) {
  if (!Array.isArray(allowedModels) || allowedModels.length === 0) return
  if (allowedModels.some((candidate) => candidate.provider === route.provider && candidate.model === route.model)) return
  const routes = allowedModels.map((candidate) => `${candidate.provider}/${candidate.model}`).join(', ')
  throw new Error(`delegation route "${route.provider}/${route.model}" is not allowed; allowed routes: ${routes}`)
}
