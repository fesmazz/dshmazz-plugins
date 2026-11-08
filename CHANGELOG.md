# Changelog

All notable changes to this repository. Each plugin follows Semantic Versioning and
keeps its own `CHANGELOG.md` next to its package; this file summarises plugin
releases and repository-level changes.

## Unreleased

### Added
- UI proposal for V1.1 and V1.2, with rendered mockups in
  [`docs/mockups/v1.1/`](docs/mockups/v1.1/README.md): profiles settings, file
  auto-configuration, and session model/cost tracking.
- Refined after owner review: global defaults plus a right-sidebar session override
  panel, file-or-paste auto-configure with re-apply on change, a Rates tab with a
  bundled snapshot and custom rate-card template, and separate Team/Subagent usage.
- Repository rule requiring a changelog for every plugin (`AGENTS.md`).
- Harness extension patch for 0.2.1-rc.5 under
  [`patches/deepseek-harness/`](patches/deepseek-harness/README.md): optional
  teammate route fields and `agentOptions` passthrough (V1.2 groundwork).
- V1.1/V1.2 implementation plan in
  [`docs/plans/delegation-v1.1.md`](docs/plans/delegation-v1.1.md).
- V1.1 host foundation: bundled category catalog, bundled rate card with
  validation and cost estimation, token-usage folding, and an atomic JSON state
  store for profiles/rates/source; covered by 15 `node --test` cases.
- V1.1 profile rows and host routes: agent-type × task-type rows with validation,
  per-session row overrides, `state`/`profiles`/`rates`/`source`/`overrides`
  routes, dynamic tool routing through rows, and profile unit tests (34 total).
- V1.1 client half: Plugins → Delegation Models page (Profiles, Rates,
  Auto-configure source) and a right-sidebar session override panel; manifest
  client entry; state extras (`availableModels`, `bundledRates`, session
  overrides) and a route method guard.
- V1.1 session usage: `GET /usage` aggregates live Team and Subagent rows with
  token totals and cost from the active rate card plus the Token & Balance
  balance; the sidebar panel renders the summary and separate Team/Subagent
  tables.
- V1.1 auto-configure parsing: `POST /parse` asks the configured default route
  for strict JSON through the `llm` service, extracts and validates it into
  rows, and the Auto-configure tab reviews and applies the proposals; parse
  helpers covered by tests (43 total).
- V1.1 watched auto-configure: a file source with `autoApply` is polled, re-parsed
  and re-applied when it changes, with `appliedAt`/`lastError` and the source path
  in the state and UI; watcher covered by tests (46 total).

## 2026-11-07 — repository 0.2.0

### Added
- `@mazz/dsh-delegation-models` 0.1.0: model-aware delegation tools, profile
  routing and a system-prompt policy section. See
  [its changelog](plugins/dsh-delegation-models/CHANGELOG.md).

## 2026-11-07 — repository 0.1.1

### Changed
- Renamed the repository to `dshmazz-plugins` and adopted the MIT licence.

## 2026-11-07 — repository 0.1.0

### Added
- Repository created, with `@mazz/dsh-token-balance` 1.0.0
  ([changelog](plugins/dsh-token-balance/CHANGELOG.md)).
