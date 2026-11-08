/**
 * Feature detection for teammate model routing.
 *
 * Three builds matter:
 * - `patched`: the 0.2.1 harness with the route fields added to `spawn_teammate`
 *   (this repository's patch). The tool accepts provider/model/reasoning_effort.
 * - `native`: 0.2.2+, where `spawn_teammate` is gone and teammates are
 *   continuable subagents with native model selection.
 * - `unpatched`: a stock 0.2.1 `spawn_teammate` that only inherits the Lead
 *   route; teammate rows cannot affect it.
 */

/**
 * Detect the teammate-routing mode from one agent's visible tool schemas.
 * @param input - `{ schemas, modelSelection }`, where modelSelection says
 *   whether the harness advertises subagent model selection.
 * @returns `{ mode, tool, parameters }`.
 */
export function detectTeammateRouting(input) {
  const schemas = Array.isArray(input?.schemas) ? input.schemas : []
  const spawn = schemas.find((schema) => schema?.name === 'spawn_teammate')
  if (spawn !== undefined) {
    const properties = spawn.parameters !== null && typeof spawn.parameters === 'object'
      && spawn.parameters.properties !== null && typeof spawn.parameters.properties === 'object'
      ? spawn.parameters.properties
      : {}
    const patched = Object.hasOwn(properties, 'provider') && Object.hasOwn(properties, 'model')
    return {
      mode: patched ? 'patched' : 'unpatched',
      tool: 'spawn_teammate',
      parameters: Object.keys(properties),
    }
  }
  const subagent = schemas.find((schema) => schema?.name === 'subagent')
  if (subagent !== undefined) {
    return {
      mode: input?.modelSelection === true ? 'native' : 'native-unselected',
      tool: 'subagent',
      parameters: Object.keys(subagent.parameters?.properties ?? {}),
    }
  }
  return { mode: 'unsupported', tool: null, parameters: [] }
}
