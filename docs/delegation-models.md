# Delegation Models

`@mazz/dsh-delegation-models` makes a requested delegation model stick. It routes
subagent work through model profiles (agent type × task type × tier × route ×
effort), remembers a session's profile, and adds a Web UI to edit the policy, watch
an auto-configure source, and inspect per-session usage.

## Surfaces

- **Plugins → Delegation Models** (settings page): Profiles, Rates and
  Auto-configure tabs.
- **Right-sidebar session panel**: inherits the global rows, allows per-row session
  overrides, and shows session usage split into Team and Subagent tables.

Both read and write the same host state; no credential crosses the wire.

## Tools

- **`delegate_model`** — starts a continuable subagent on a routed model. Accepts a
  named `profile`, an `agent_type` + `task_type` row lookup, or explicit
  `provider` + `model` + `reasoning_effort`. Returns the `subagentId`; the child is
  a durable continuable subagent (`send_message` steers or continues it).
- **`set_delegation_profile`** — records the profile this session should use for
  later delegations; `{ "clear": true }` removes it.

A system-prompt section publishes the current rows, the session override and how
instructions are honored. It appears only for scopes that can see the tool.

## State and routes

State is persisted atomically at
`<profile directory>/delegation-models/state.json` (profiles, rates, source). The
host registers these same-origin routes:

| Route | Purpose |
| --- | --- |
| `GET /dsh-delegation-models/state` | catalog, state, available models, teammate capability, session overrides (`?sessionId=`) |
| `POST /dsh-delegation-models/profiles` | replace rows, default row and allowlist |
| `POST /dsh-delegation-models/rates` | replace a validated rate card |
| `POST /dsh-delegation-models/source` | save a `paste`/`file` auto-configure source |
| `POST /dsh-delegation-models/parse` | LLM-parse rules into proposals (no write) |
| `GET /dsh-delegation-models/usage` | Team/Subagent usage, cost and balance |
| `POST /dsh-delegation-models/overrides` | set or reset a session's row overrides |

## Profiles and routing

Rows are keyed `agentType::taskType`; the bundled catalog covers tiers
(`light`/`capable`/`premium`), agent types (`lead`/`teammate`/`subagent`/`reviewer`)
and task types (`orchestration`/`planning`/`implementation`/`review`/`security-review`/
`verification`/`extraction`/`cleanup`). Copied and generalized from the owner's
guidelines on 2026-11-07; nothing links back to an external file.

Routing order: explicit `provider`+`model`; otherwise the row for `agent_type` +
`task_type` (session override row first); otherwise the named/default profile. A
profile's effort is used unless the call names one; changing the route without
naming an effort uses the model default. Explicit routes must be in the allowlist
when one is configured.

The original YAML config still works (same row id):

```yaml
- id: delegation-models
  name: '@mazz/dsh-delegation-models'
  config:
    provider: spawn
    defaultProfile: cheap
    allowedModels:
      - provider: deepseek-account
        model: deepseek-flash
    profiles:
      cheap:
        provider: deepseek-account
        model: deepseek-flash
        reasoningEffort: high
```

## Rates

A bundled USD snapshot (`per_1m_tokens`) is the default for cost estimates. The
Rates tab can reset to the snapshot, edit values, or apply a custom JSON card
(`{ version: 1, currency, unit, models: [{ provider, model, input, cacheRead,
cacheWrite, output }] }`). Validation rejects missing fields, negative numbers and
duplicate routes. Costs are estimates, never billing.

## Auto-configure

Paste rules or choose a file; **Parse with agent** sends the text to the configured
default route through the `llm` service, which is asked for strict JSON. Proposals
are validated against the catalog and shown for review; applying them replaces the
profile rows.

A `file` source with `autoApply` is polled; when it changes the plugin re-parses and
re-applies it, recording `appliedAt` and `lastError`. The source path, the last
apply and the last error are shown in the tab.

## Session usage

`GET /usage?sessionId=` walks the live agents under the session root, classifies
Team members (Lead and teammates) versus subagents, folds each session's
`assistant/message` token usage, estimates cost with the active rate card, and
attaches the balance from the Token & Balance plugin when that route answers. The
sidebar panel renders the summary plus separate Team and Subagent tables.

## Teammates (V1.2)

Teammate routing is gated by feature detection from the live tool schemas:

| Mode | Meaning |
| --- | --- |
| `patched` | 0.2.1 with the `spawn_teammate` route fields (`provider`/`model`/`reasoning_effort`) |
| `native` | 0.2.2+, where teammates are continuable subagents with native model selection |
| `unpatched` | stock 0.2.1 `spawn_teammate`; teammate rows cannot change it |
| `unsupported` | neither tool is visible |

The mode appears in `GET /state`, in both UI surfaces, and in the policy prompt:
patched builds are told to pass the teammate row route to `spawn_teammate`; native
builds to use the subagent path; unpatched builds to use `delegate_model`. See
[the harness patch](../patches/deepseek-harness/README.md) for the 0.2.1 extension.

## Verification

- `node --test` — 50 pure tests (`src/` modules; no live harness).
- Live checks on the desktop host: state read/write and validation, override
  round-trip, LLM parse of a three-rule sample, watched file re-apply, and `GET
  /usage` with the Token & Balance summary.
- Harness patch: `git apply --check` passes against `dsh-v0.2.1-rc.5`; it was not
  built because the harness dependency tree is not installed in this workspace.

Client rendering needs a page refresh after install and was not visually verified
here; host routes were verified directly.
