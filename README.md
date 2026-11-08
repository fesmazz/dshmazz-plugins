# DSH Mazz plugins

A personal collection of [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)
plugins. One installable bundle per package under `plugins/`, each published in
the `@fesmazz/` scope.

## Plugins

| Plugin | Package | What it does |
|---|---|---|
| Token & Balance | `@fesmazz/dsh-token-balance` | Shows DeepSeek balance, a 24-hour hover usage summary and a right-Sidebar usage panel. [Details](docs/token-balance.md). |
| Delegation Models | `@fesmazz/dsh-delegation-models` | Routes subagent delegations through named model profiles so a requested model is applied instead of inherited. [Configuration](docs/delegation-models.md). |

## Install

Install a plugin bundle from this checkout:

```sh
dsh plugin --profile web add /absolute/path/to/dshmazz-plugins/plugins/dsh-token-balance
```

Then restart `dsh web` (or refresh the Web UI) and enable the plugin under
Settings → Plugins. A plugin that ships a Web UI half needs a page refresh to
load its client module.

## Structure

- `plugins/<name>/` — one installable bundle each: `package.json` (with
  `dsh.bundle.patch` and optional `dsh.client`), `cordis.patch.yml`, host
  `index.js`, optional `client.js`, `src/`, `test/`, `locale/`, `icon.svg`.
- `docs/adding-a-plugin.md` — how to add the next plugin.
- `docs/delegation-models.md` — profiles and routing for the delegation plugin.
- `docs/token-balance.md` — the 24-hour usage model, rate table and limits of the
  Token & Balance plugin.
- `docs/mockups/` — UI proposals awaiting owner review (V1.1/V1.2).
- `AGENTS.md` — rules for agents working in this repository.
- `pnpm-workspace.yaml` — workspace listing (`plugins/*`).

## Development

Each plugin is self-contained and needs no build step. Run a plugin's tests from
its directory:

```sh
cd plugins/dsh-token-balance && node --test
```

## Versioning

Each plugin follows SemVer and keeps a `CHANGELOG.md` next to its package; the root
[CHANGELOG.md](CHANGELOG.md) lists plugin releases and repository changes. The
changelog requirement is a repository rule in
[AGENTS.md](AGENTS.md#versioning-and-changelogs).

## Licence

MIT — see [LICENSE](LICENSE).
