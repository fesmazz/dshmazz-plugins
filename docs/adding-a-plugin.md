# Adding a plugin

[Repository home](../README.md) · [Rules](../AGENTS.md)

One plugin is one installable bundle directory.

## 1. Create the package

```text
plugins/dsh-<topic>/
  package.json          # name @fesmazz/dsh-<topic>, dsh.bundle.patch, optional dsh.client
  cordis.patch.yml      # inserts the host row: name must equal the package name
  index.js              # host half: export name, inject, apply(ctx, config)
  client.js             # optional Web UI half: window.__ModuleLoader__.load({ id, factory })
  src/                  # pure logic (testable)
  test/                 # node:test files
  locale/en.json        # meta.title and meta.description
  icon.svg              # original or licensed artwork
  CHANGELOG.md          # version log; required by AGENTS.md
```

Minimum `package.json`:

```json
{
  "name": "@fesmazz/dsh-<topic>",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./index.js",
    "./client": "./client.js",
    "./locale/*.json": "./locale/*.json",
    "./icon": "./icon.svg"
  },
  "files": ["index.js", "client.js", "src/*.js", "cordis.patch.yml", "locale/*.json", "icon.svg"],
  "dsh": {
    "bundle": { "patch": "./cordis.patch.yml" },
    "client": { "platform": "web", "immediately": true, "inject": ["@deepseek-ai/dsh-client-ui-conversation"] }
  }
}
```

## 2. Follow the boundary rules

- Host half: export `name`, optional `inject`, and `apply(ctx, config)`. Register
  every resource inside `apply` with `ctx.effect`/`ctx.on`.
- Never import `@deepseek-ai/*` from a profile-linked plugin; reach services
  through `ctx.get(...)`.
- Client half: the module id equals the package name; register through
  `ctx.slots.inject(...)`; no DOM outside the component and no second app root.
- Put pure logic in `src/*.js` and test it with `node --test`.

## 3. Verify and record

1. `cd plugins/dsh-<topic> && node --test`
2. Install for local verification: `dsh plugin --profile web add <absolute path>`
   (or the app's plugin manager), then restart `dsh web` and refresh the page.
3. Exercise the feature; a live route or slot registration is the evidence, not
   the install result.
4. Add the plugin row to the root `README.md` and its `dsh.client.inject`
   dependencies as needed.
5. Add `CHANGELOG.md` with the initial version entry, and update it with every
   behaviour or version change (see `AGENTS.md`, "Versioning and changelogs").
