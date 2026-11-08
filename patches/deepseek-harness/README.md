# DeepSeek Harness extension: teammate model routing

Status: **local patch against DeepSeek Harness 0.2.1-rc.5, authored 2026-11-08.
`git apply --check` passes; not built (the harness dependency tree is not installed
here) and not applied to the installed app.** The plugin's V1.2 UI feature-detects
it.

## What the patch changes

- `@deepseek-ai/dsh-experimental-agent-team`: `SpawnTeammateRequest` gains optional
  `agentOptions`; `spawnAdmitted` passes it to `ctx.subagents.startActivation`.
- `@deepseek-ai/dsh-experimental-tool-agent-team`: `spawn_teammate` gains optional
  `provider`, `model`, and `reasoning_effort`; a `modelSelection` config (default
  `true`) gates them. The tool validates the pair, preflights the route through
  `ctx.llm.resolveCallConfig`, and passes `agentOptions` in the spawn request.
- New pure resolver (`src/spawn-selection.ts`) with vitest coverage
  (`tests/spawn-selection.spec.ts`); both package READMEs document the fields.

The backend provider name already occupies `provider` on the request, so the child
LLM route is carried as `agentOptions` rather than three request fields that would
collide with it.

## How the plugin detects it

`GET /dsh-delegation-models/state` exposes `teammates.mode`, computed from one live
agent's visible tool schemas (`ctx.tools.schemas(agent)`):

- `spawn_teammate` present with `provider` and `model` in its parameters →
  `patched`;
- `spawn_teammate` present without them → `unpatched`;
- no `spawn_teammate` but a `subagent` tool → `native` (or `native-unselected` when
  model selection is off);
- neither → `unsupported`.

The exact parameters of the stock tool are reported as
`name/description/prompt/context`, and the policy prompt then directs
model-specific work to `delegate_model`.

## Apply and test

```sh
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
git checkout dsh-v0.2.1-rc.5
git am /path/to/0001-feat-agent-team-spawn-model-routing.patch
pnpm install
pnpm vitest run packages/experimental/tool-agent-team/tests/spawn-selection.spec.ts
pnpm run typecheck
```

The installed application cannot be patched in place: its sources live inside
`app.asar` and a modified bundle breaks signing and is replaced on update. To use
the change, rebuild the harness from source or ship the patch upstream.

## Why the 0.2.1-rc.5 tag

The installed app is 0.2.1-rc.5, where `spawn_teammate` exists without model fields.
Upstream 0.2.2-rc.1 removed `spawn_teammate`; teammates are continuable subagents
created by the subagent tool, which already exposes `provider`, `model`, and
`reasoning_effort`. On 0.2.2+ the V1.2 UI feature-detects that route and no patch
is needed.

## Limitations

- `spawn_teammate` does not check the route against `subagentModelSelection` allowed
  models; the team tool does not read that service. Add that check in the tool or
  the team service if the policy must apply to teammates.
- The patch was not built or run in this workspace; the checks above are the
  verification plan.
