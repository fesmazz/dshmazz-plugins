# Changelog — @fesmazz/dsh-token-balance

## [1.3.10] - 2026-11-08

### Changed
- Removed the Cost/Tokens tabs: the Usage panel is cost-only, keeping the Y-axis
  selector and the chart layout unchanged.
- The time-range selector moved back above the stat values and is left-aligned;
  the Cost / API requests / Tokens stat columns are centered.
- The balance is larger (34px) with Top up on the same line, followed by a 24px
  spacer before the stats.
- The Consumption section is collapsible: the header toggles the doughnuts and
  table, and collapsing gives the chart extra height.

## [1.3.9] - 2026-11-08

### Fixed
- The doughnut pair now scales with the pane width instead of capping at 166px:
  ring size, gap and side margins are derived from the measured panel width, so
  widening the pane enlarges the rings and keeps the layout proportional. The band
  stays at ~8% of the ring diameter, matching the approved concept.

## [1.3.8] - 2026-11-08

### Changed
- Doughnuts now use the approved C2 geometry: larger rings with a 19px band
  (scaled to the available width), 21px side margins and a 12px gutter. Labels
  move below each ring; the hover overlay still covers every slice.

## [1.3.7] - 2026-11-08

### Changed
- Removed the small legends under the doughnuts. Slices that are large enough now
  carry their own label with a leader line; small slices show their name only in
  the hover overlay.
- The two doughnuts use separate colour palettes.

## [1.3.6] - 2026-11-08

### Changed
- The second doughnut now groups sessions by **session kind** — Chat, Team member,
  Sub-agent, or Undefined — instead of one slice per session; the table adds a Kind
  column for each session row.
- Both doughnuts show a small legend with names and percentages, so the project
  name is visible even when there is a single workspace.

## [1.3.5] - 2026-11-08

### Changed
- The time-range selector now shares one row with the Y-axis selector above the
  chart, instead of sitting alone at the top of the panel.
- The consumption breakdown groups by **workspace** again (the workspace name from
  the session header), not by an inferred subfolder.

## [1.3.4] - 2026-11-08

### Added
- A guide card in the right-sidebar Start page ("Usage & balance") that opens the
  Usage tab, so the plugin is visible from a new session instead of only in the
  settings area.

## [1.3.3] - 2026-11-08

### Changed
- The remaining balance now leads the Usage panel: a banner under the header shows
  the cyan balance, its label, and a discrete **Top up** link to the DeepSeek
  platform. The old top-right balance chip is gone; the duplicated window-spend
  line was dropped.

## [1.3.2] - 2026-11-08

### Added
- Y-axis selector for the cost chart with fixed USD ranges ($0.50, $1, $1.50, $2,
  $5, $10, $20, $50, $100); the chosen range applies to the chart and upgrades to
  the next range when the data would not fit.
- Consumption doughnut charts (by project and by session) below the chart, plus a
  grouped table showing project and session cost and token totals.
- The window response now carries a `breakdown` of projects and sessions with their
  cost and token totals.

## [1.3.1] - 2026-11-08

### Changed
- Bucket size follows the selected range: 6h and 12h in 30-minute buckets, 24h
  hourly, 48h two-hourly; the panel chart title matches the bucket size.
- The dock bar shows the balance and this session's cost for the selected range;
  token totals are no longer shown there.

## [1.3.0] - 2026-11-08

### Added
- The hover card compares this session with all sessions for the selected window
  and shows the session's share of the window's cost.
- A shared 6/12/24/48-hour range selector in the hover card, the panel header and
  the dock summary; 48-hour charts use two-hour buckets.
- The route accepts `hours` and `sessionId` and returns the session's totals for
  the requested window.

### Changed
- The hover card no longer draws the ambiguous sparklines; it shows the
  session-vs-all comparison and the percentage line.
- Reports are cached per range and session; a longer range re-reads a session once
  to include older events.

### Fixed
- 48-hour charts use relative time labels instead of repeating clock hours.

## [1.2.0] - 2026-11-08

### Changed
- Renamed the package scope from `@mazz` to `@fesmazz` (the owner's handle;
  `@mazz` belongs to someone else). No behaviour change: the client module id,
  the sidebar tab type id and the in-package references use the new scope.

## [1.1.0] - 2026-11-08

### Added
- Hover summary above the composer dock: estimated cost and token sparklines for
  the last 24 hours, with a click-through to the full panel.
- Right-Sidebar **Usage** tab (`ctx.sidebarRightTabs`), opened by clicking the dock
  line: Cost and Tokens views with 24 clock-aligned hourly buckets stacked by model,
  responsive SVG bars, and a per-bar breakdown on hover.
- The route now returns a 24-hour `window` report: per bucket and per model token
  counts, request counts and estimated cost, plus grand totals.
- `rates.json` editable list-price table (peak and off-peak cache-hit, cache-miss
  and output rates; peak windows and weekdays), with a plugin-config `rates` override.
- `ctx.sessionQuery` reads for live and persisted sessions, with a live-session
  fallback and a per-session cache keyed by log length.

### Changed
- The dock line summarises the rolling 24-hour window
  (`Balance … · 24h … · … tokens`) instead of per-session input/output totals.
- Cost is estimated from official DeepSeek list prices and the peak/off-peak UTC
  windows are applied per event; the report labels it as an estimate.
- The client half injects `@deepseek-ai/dsh-client-ui-sidebar-right` and the package
  version is now 1.1.0.

### Fixed
- A live session whose log grows during a report read is re-read on the next poll
  instead of caching a snapshot with a missing tail.
- The route keeps returning the balance when the usage report fails, and the panel
  shows a retry action instead of a blank column.
- The sidebar services are declared in the client plugin's inject list, so a
  dynamically loaded plugin can open the Usage tab as well as the static boot path.
- Guards for a missing ResizeObserver, locale-aware integer grouping, derived chart
  tick positions, React keys in the panel, and a preview width clamped to the
  viewport.
- The committed harness screenshots use placeholder copy instead of chat text.

### Known limits
- Persisted sessions are pre-filtered by `header.createdAt` inside the 24-hour
  window; a session created before the window and archived without being live while
  the plugin ran is not read.
- Chinese public holidays are not modelled for peak pricing, so peak-hour estimates
  on those days can be high.
- The component harness verifies layout and interaction; the live slot rendering
  needs a page refresh in the running profile.

## [1.0.0] - 2026-11-07

### Added
- Host route `GET /dsh-token-balance`: remaining balance from the signed-in DeepSeek
  account wallet, with the `DEEPSEEK_API_KEY` / `api.deepseek.com/user/balance`
  fallback, plus token usage summed from live sessions.
- Web UI entry in the composer dock showing balance, input/output tokens and cache
  reads.

### Changed
- Moved from the `@local/` placeholder package into `dshmazz-plugins` as
  `@fesmazz/dsh-token-balance`.

### Known limits
- Token usage covers live sessions only; archived history needs `ctx.sessionQuery`.
- The rendered dock line was not visually verified; it loads on page refresh.
