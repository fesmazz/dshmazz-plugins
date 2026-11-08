# Changelog

All notable changes to this plugin. Root repository changelog:
[`../../CHANGELOG.md`](../../CHANGELOG.md).

## [0.1.0] - 2026-11-08

### Added

- Project sections that group sessions independently of workspace folders, so
  several projects can share one root directory.
- Create, rename, and delete projects; assign a session to a project; **move a
  session from one project to another**; remove a session from its project.
- Web UI: a **right-sidebar Projects tab** (a persistent, always-reachable
  browser) and a **Projects panel in the left sidebar rail**, both of which
  browse and switch — **click a project's session to open it** — with
  create/rename/delete/move/remove and **drag-to-assign** (drag a session's
  project badge onto a project), a **＋ New project** shortcut in the sidebar
  foot, a **Settings → Projects** page, and a draggable project badge in the
  session-row leading cell.
- Same-origin JSON API under `/dsh-project-sections` and an agent `project`
  tool (`list`/`create`/`rename`/`delete`/`assign`/`move`/`unassign`).
- Durable state in the `project_sections` storage domain.

### Notes

- Spend/cost tracking is intentionally out of scope for this plugin; that
  belongs to the Token & Balance plugin.
