# DSH Mazz plugins

A personal collection of [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)
plugins. One installable bundle per package under `plugins/`, each published in
the `@mazz/` scope.

## Plugins

| Plugin | Package | What it does |
|---|---|---|
| Token & Balance | `@mazz/dsh-token-balance` | Shows DeepSeek token usage and the remaining account balance below the composer. |

## Install

Install a plugin bundle from this checkout:

```sh
dsh plugin --profile web add /absolute/path/to/dsh-mazz-plugins/plugins/dsh-token-balance
```

Then restart `dsh web` (or refresh the Web UI) and enable the plugin under
Settings → Plugins. A plugin that ships a Web UI half needs a page refresh to
load its client module.

## Structure

- `plugins/<name>/` — one installable bundle each: `package.json` (with
  `dsh.bundle.patch` and optional `dsh.client`), `cordis.patch.yml`, host
  `index.js`, optional `client.js`, `src/`, `test/`, `locale/`, `icon.svg`.
- `docs/adding-a-plugin.md` — how to add the next plugin.
- `AGENTS.md` — rules for agents working in this repository.
- `pnpm-workspace.yaml` — workspace listing (`plugins/*`).

## Development

Each plugin is self-contained and needs no build step. Run a plugin's tests from
its directory:

```sh
cd plugins/dsh-token-balance && node --test
```

## Licence

Not yet chosen (owner decision).
