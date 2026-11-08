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
- Released [`@fesmazz/dsh-delegation-models` 0.2.0](plugins/dsh-delegation-models/CHANGELOG.md)
  — V1.1 complete plus V1.2 teammate-routing feature detection.
- Released [`@fesmazz/dsh-delegation-models` 0.3.0](plugins/dsh-delegation-models/CHANGELOG.md)
  — V1.2 teammate routing behind feature detection, rewritten usage documentation,
  and a verified harness patch README.
- Released [`@fesmazz/dsh-delegation-models` 0.3.1](plugins/dsh-delegation-models/CHANGELOG.md)
  — merged `main` (token-balance 1.2.0 and the `@fesmazz` rename) and renamed the
  delegation package, client module id and references; no behaviour change.
- Released [`@fesmazz/dsh-delegation-models` 0.3.2](plugins/dsh-delegation-models/CHANGELOG.md)
  — V1.1.1 fixes: robust auto-configure parsing, a session monitor with Team and
  Subagent status, and a composer dock to open it from running sessions.

### Changed
- Renamed the npm scope from `@mazz` to `@fesmazz` (the owner's handle;
  `@mazz` belongs to someone else). `@fesmazz/dsh-token-balance` 1.2.0 and
  `@fesmazz/dsh-delegation-models` 0.1.1 carry the rename; this branch released
  the delegation rename as 0.3.1 after merging the change.

## 2026-11-08 — repository 0.2.3

### Changed
- `@fesmazz/dsh-token-balance` 1.3.1: dynamic 30-minute/1-hour/2-hour buckets by
  range, the dock bar showing only the balance and this session's cost, plus the
  balance-first Usage panel, a consumption breakdown by project/session kind,
  responsive doughnuts, a collapsible Consumption section and a Start-page guide
  card ([changelog](plugins/dsh-token-balance/CHANGELOG.md)).

## 2026-11-08 — repository 0.2.2

### Changed
- `@fesmazz/dsh-token-balance` 1.3.0: the hover card compares this session with all
  sessions, a shared 6/12/24/48-hour range drives the card, panel and dock summary,
  and 48-hour charts use two-hour buckets
  ([changelog](plugins/dsh-token-balance/CHANGELOG.md)).

## 2026-11-08 — repository 0.2.1

### Changed
- `@fesmazz/dsh-token-balance` 1.1.0: a 24-hour usage report from session history, a
  right-Sidebar Cost/Tokens panel, a hover sparkline summary and an editable
  list-price rate table ([changelog](plugins/dsh-token-balance/CHANGELOG.md)).

## 2026-11-07 — repository 0.2.0

### Added
- `@fesmazz/dsh-delegation-models` 0.1.0: model-aware delegation tools, profile
  routing and a system-prompt policy section. See
  [its changelog](plugins/dsh-delegation-models/CHANGELOG.md).

## 2026-11-07 — repository 0.1.1

### Changed
- Renamed the repository to `dshmazz-plugins` and adopted the MIT licence.

## 2026-11-07 — repository 0.1.0

### Added
- Repository created, with `@fesmazz/dsh-token-balance` 1.0.0
  ([changelog](plugins/dsh-token-balance/CHANGELOG.md)).
