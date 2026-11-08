# Delegation Models V1.1 / V1.2 implementation plan

Status: **active**. Branch `feat/delegation-v1.1`, worktree
`~/Projects/worktrees/dshmazz-plugins-delegation-v1.1` (from `origin/main`
`744d432`). Goal `goal-3bc1fd10-fdd6-46ce-bbfd-089b8ac31a15`.

## Scope

**V1.1**
- Global profiles page under Plugins → Delegation Models: rows of agent type ×
  task type, model tier, route and effort; add/remove; save.
- Right-sidebar panel (`sidebar.right.pane.tab`) inheriting the global rows, with
  per-session override toggles and "Apply to session".
- Auto-configure: accept a file or pasted rules; watch the stored source and
  re-apply on change; parse through the configured model; review before apply.
- Rates tab: bundled snapshot copied and generalized from the owner's guidelines,
  plus a custom rate card from a JSON/YAML template; validate/save.
- Session usage: balance/cost/tokens from Token & Balance; separate Team and
  Subagent tables; model split.

**V1.2**
- Harness extension for 0.2.1-rc.5: `SpawnTeammateRequest.agentOptions`,
  `spawn_teammate` `provider`/`model`/`reasoning_effort`, `modelSelection` config,
  preflight and passthrough (patch under `patches/deepseek-harness/`).
- Plugin feature detection: expose teammate model controls only when the running
  `spawn_teammate` schema carries the route fields (patched 0.2.1) or the harness
  is 0.2.2+ where teammates are subagents (then use the subagent tool).
- Same profiles/rates/usage UI as V1.1.

## Architecture (proposed)

- Host `index.js` keeps the existing `delegate_model`/`set_delegation_profile`
  tools and adds same-origin routes under `/dsh-delegation-models/`:
  `state` (profiles, categories, rates, session overrides), `profiles` (save),
  `source` (get/save/parse/watch status), `rates` (save/import), `usage`
  (balance/cost/tokens; Team and Subagents from `ctx.agentTeams`/`ctx.subagents`
  plus Token & Balance's route).
- Bundled data modules: `src/categories.js` (agent types, task types, tiers),
  `src/rates.js` (snapshot + template validation), `src/policy.js` (existing),
  `src/source.js` (parse prompt/validation + watcher state).
- Session overrides: in-memory `WeakMap<Session, Overrides>` (resets on restart;
  note it), consumed by `delegate_model` and the prompt section.
- Client `client.js`: one module registering
  - a `plugins.tab` page (Global profiles / Auto-configure / Rates / Session usage),
  - a `sidebar.right.pane.tab` session panel (inherited rows + overrides),
  both reading the host routes; no DOM outside components.
- Persistence: profiles/rates in the plugin row config (edited through the
  `configEditor` service if available) or a storage service; choose after inspecting
  `configEditor`/`storageDomain`. The source text and watch path live in the same
  store.

## Work breakdown

1. **Host state + routes** — config normalization, session overrides, rate card
   load/validate, usage aggregation (Team vs Subagents), tests for pure modules.
2. **Client global page** — tabs, profile matrix, add/remove, save; routes wired.
3. **Client sidebar panel** — inherited rows, override toggles, apply/reset.
4. **Auto-configure** — paste/file intake, LLM parse with strict JSON, review/apply,
   watcher (fs.watch + debounce) and re-apply; tests for the parse/apply mapping.
5. **Rates** — bundled snapshot module, template validation, import/validate/save.
6. **Usage** — integrate the token-balance route; separate tables; cost from the
   active rate card; tests for cost math.
7. **Harness patch** — already authored on `feat/teammate-model-routing` (clone
   `worktrees/deepseek-harness-agent-team`), exported and documented; add the
   feature-detection path.
8. **Verification** — `node --test` per plugin, live route checks, feature-detect
   checks, changelog entries, version bumps (0.2.0 for V1.1, 0.3.0 for V1.2).
9. **Records** — Hundun session log/RESUME/STATUS/CURRENT_STATE; push branch.

## Risks and limits

- The concurrent session owns `feat/token-balance-v1.1` in the main checkout; do
  not touch its files, branch, or uncommitted work. Install the plugin from this
  worktree while developing.
- No browser control: client rendering is verified by slot registration plus
  `read_image` of mockups, not by clicking the live page; state that limit.
- The harness patch cannot be applied to the installed app; V1.2 UI must degrade
  cleanly and say so.
- The LLM-based parser costs tokens per parse; cache by content hash and require
  an explicit apply.
