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
