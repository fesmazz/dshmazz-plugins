# Changelog — @mazz/dsh-delegation-models

## [0.2.0] - 2026-11-08

### Added
- V1.1 settings page under Plugins → Delegation Models with Profiles, Rates and
  Auto-configure tabs; add/remove agent-type × task-type rows with tier, route
  and effort, and choose the default row.
- V1.1 right-sidebar session panel: inherits the global rows, allows per-row
  session overrides, and shows session usage split into Team and Subagent tables
  with token totals, estimated cost and the Token & Balance balance.
- V1.1 persistent state (profiles, rates, source) in an atomic JSON document under
  the profile directory, plus `state`/`profiles`/`rates`/`source`/`overrides`/
  `usage` host routes.
- V1.1 bundled generalized category catalog and rate-card snapshot, custom
  rate-card validation, and per-route cost estimation.
- V1.1 auto-configure from a file or paste: LLM parse into validated rows,
  review/apply, and a watched file source that re-applies on change with
  `appliedAt`/`lastError`.
- V1.2 groundwork: teammate-routing feature detection (`patched`, `native`,
  `unpatched`, `unsupported`) surfaced in state and the UI, with a
  capability-aware prompt line.

### Changed
- `delegate_model` accepts `agent_type`/`task_type` and routes through the stored
  profile rows.

### Tests
- 50 `node --test` cases.

### Known limits
- On a stock 0.2.1 harness the teammate rows cannot change `spawn_teammate`; use
  the V1.2 harness patch or a 0.2.2+ build.
- The client UI needs a page refresh after install; rendering was not visually
  verified in this environment.

## [0.1.0] - 2026-11-07

### Added
- `delegate_model`: starts a continuable subagent on a routed model (named profile,
  or explicit provider/model/effort) and returns its `subagentId`.
- `set_delegation_profile`: records the profile a session should use for later
  delegations, and clears it on request.
- Profile catalog derived from config, the live subagent model-selection allowlist,
  or the Lead default; system-prompt policy section; 13 `node --test` policy tests.
- Documentation: `docs/delegation-models.md`.

### Known limits
- Teammates started with `spawn_teammate` inherit the Lead model; per-teammate
  routing is planned for V1.2 (custom subagent provider plus team-tool config).
