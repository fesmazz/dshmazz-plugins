# Changelog — @fesmazz/dsh-delegation-models

## [0.1.1] - 2026-11-08

### Changed
- Renamed the package scope from `@mazz` to `@fesmazz` (the owner's handle;
  `@mazz` belongs to someone else). No behaviour change.

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
