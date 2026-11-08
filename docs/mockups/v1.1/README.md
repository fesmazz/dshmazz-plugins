# V1.1 / V1.2 UI proposal

Status: **refined after owner review — not implemented.**

Rendered from the `*.html` files with headless Chrome at 1440×900.

## Owner decisions applied (2026-11-07)

1. **Placement:** global defaults live on **Plugins → Delegation Models**; a
   **right-sidebar panel** inherits them and can override any row for one session.
2. **Auto-configure:** file **or paste**; the source is remembered and watched, and
   re-applies when it changes (version-logged).
3. **Rates:** a bundled snapshot copied from the owner's current guidelines
   (generalized) is the default; custom rate cards can be supplied from a template.
4. **Usage rows:** the Team roster and subagents stay separate.
5. **Categories:** copied into the plugin; no external link to Hundun.

## Screens

- [settings.png](settings.png) — global profiles: agent type × task type → tier,
  route, effort; tabs for Profiles, Auto-configure, Rates, Session usage.
- [sidebar.png](sidebar.png) — right-sidebar panel inheriting the global rows, with
  per-session override toggles and "Apply to session".
- [import.png](import.png) — auto-configure: file or paste, watched source with
  re-apply, plugin-bundled categories, confidence and source line, apply after review.
- [rates.png](rates.png) — rate card tab: bundled snapshot, custom JSON/YAML template,
  validate/save.
- [usage.png](usage.png) — session usage with separate Team and Subagents tables,
  balance/cost/tokens from Token & Balance, model split.

## Open item: V1.2 teammate routing

The team tool's `spawn_teammate` takes no model argument. Recommendation: extend the
harness (`SpawnTeammateRequest` and the tool) with optional provider/model/effort and
pass `agentOptions` into `startActivation`, instead of overriding
`freshProvider`/`forkProvider` to a hand-written subagent provider, which would
duplicate child creation and break on harness upgrades. Rationale is in the
`dsh-delegation-models` changelog and the Hundun session log.

## Refining the mockups

Edit the HTML and re-render:

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
  --hide-scrollbars --window-size=1440,900 \
  --screenshot=settings.png file://$PWD/settings.html
```
