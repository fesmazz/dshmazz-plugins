# Changelog

All notable changes to this plugin. Root repository changelog:
[`../../CHANGELOG.md`](../../CHANGELOG.md).

## [0.1.0] - 2026-11-08

### Added

- Project sections that group sessions independently of workspace folders, so
  several projects can share one root directory.
- Create, rename, and delete projects; assign a session to a project; **move a
  session from one project to another**; remove a session from its project.
- Web UI: a **Settings → Projects** management page and a project badge in the
  session-row leading cell.
- Same-origin JSON API under `/dsh-project-sections` and an agent `project`
  tool (`list`/`create`/`rename`/`delete`/`assign`/`move`/`unassign`).
- Durable state in the `project_sections` storage domain.

### Notes

- Spend/cost tracking is intentionally out of scope for this plugin; that
  belongs to the Token & Balance plugin.
