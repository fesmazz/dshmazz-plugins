# Rules for agents in dsh-mazz-plugins

Hundun (`~/Projects/Hundun`) is the shared source of truth (HD-0001). Read its
`AGENTS.md`, `CURRENT_STATE.md` and `STATUS.md` first. This file adds
repository rules and wins where it is stricter.

## Scope

A personal collection of DeepSeek Harness (`dsh`) plugins. Each plugin is one
installable bundle under `plugins/<name>/`, named `@mazz/dsh-<topic>`.

## Layout and ownership

- One plugin per directory. Keep the host half (`index.js`, `src/`) and the
  optional Web UI half (`client.js`) in the same package while the plugin is
  small.
- `package.json` must declare `dsh.bundle.patch`; a Web UI half must declare
  `dsh.client` with `platform: "web"` and load through the slot system, never
  by writing outside its React component.
- The client module id equals the package name.
- Shared code stays in the plugin that owns it. Introduce a shared package only
  when two plugins genuinely need it.
- Adding a plugin also adds a row to the root `README.md`; follow
  `docs/adding-a-plugin.md`.

## Bundles and verification

- A profile-linked plugin must not import `@deepseek-ai/*` packages; use the
  Cordis `ctx` at runtime. Client code may `require('react')` from the browser
  module table.
- Verify through the live host route or slot tree, not from installation alone.
- Read the metadata and icon rules before installing a new bundle: localized
  `locale/*.json` title/description and an original or licensed icon.

## Tests

- Every behaviour gets a test. Pure logic lives in `src/*.js` and runs with
  `node --test`; do not make test files depend on a live harness.
- UI work is walked like a user. If browser control is unavailable, report that
  rendering is unverified instead of claiming visual success.

## Privacy and safety

- This repository is **public-meant** unless the owner records otherwise in
  Hundun's `index/repos.md`: no verbatim owner prompts, quotes or chat history
  in files, docs, commit messages or branch names. Requests stay in Hundun.
- No secrets, credentials or personal data in any committed file, and no
  absolute paths that leak personal information in public docs.
- Do not commit `node_modules`, build output, `.env` files or editor state.
- Push automatically when a remote exists; never force-push and never change
  remotes. Publication is the owner's action.
- Never publish packages or sites without the owner's go-ahead.

## Workflow

- Follow Hundun `rules/workflow.md`, `rules/agent-model-guidelines.md`,
  `rules/context-costs.md` and `rules/safety.md`.
- Work on a short-lived branch per task once a remote exists; a brand-new
  repository's initial commit may land on `main`.
- Record milestones in Hundun: the `repositories/dsh-mazz-plugins/` page,
  `sessions/YYYY/MM/`, `CURRENT_STATE.md` and `STATUS.md`.
