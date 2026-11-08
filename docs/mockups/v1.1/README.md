# V1.1 / V1.2 UI proposal

Status: **proposal for owner review — not implemented.**

Rendered from the `*.html` files with headless Chrome at 1440×900:

- [settings.png](settings.png) — **Profiles** tab: one row per agent type × task
  type, a model tier pill, the exact route and effort; version badge and changelog
  link. "Auto-configure from file…" opens the import flow.
- [import.png](import.png) — **Auto-configure** dialog: drop a JSON, XML, TXT or MD
  file; the agent maps each rule to Hundun's categories (agent type, task type,
  model tier), shows confidence and source line, and applies only after review.
- [usage.png](usage.png) — **Session usage**: remaining balance, session cost and
  token counts from Token & Balance; model split; per-agent model, tokens, cost and
  share.

## Questions for the owner

1. Placement: Plugins → Delegation Models, Settings → Plugins → Plugin
   configuration, or a right-sidebar panel?
2. Auto-configure: file picker only, or also paste? Should a parsed mapping be
   persisted and re-applied when the source file changes?
3. Cost model: where should the rate card (per provider/model, cache, peak/off-peak)
   live, and who updates it when prices change?
4. V1.2: may this plugin override the team tool's `freshProvider`/`forkProvider`
   configuration to reach a custom subagent provider?
5. Usage rows: merge teammates and subagents in one list, or keep the Team roster
   separate from subagent children?

## Refining the mockups

Edit the HTML and re-render:

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
  --hide-scrollbars --window-size=1440,900 \
  --screenshot=settings.png file://$PWD/settings.html
```
