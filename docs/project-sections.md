# Project Sections

`@fesmazz/dsh-project-sections` groups sessions into named **projects**
(sections) that are independent of workspace folders. It solves the case where
several projects share one root directory: instead of one workspace owning every
session in that folder, each session can be assigned to one of several projects
inside it.

## Model

- A **project** has an id, a name, a color, and a creation timestamp.
- A **session** belongs to **at most one** project. Assigning a session that
  already has a project **moves** it (the earlier assignment is replaced).
- Projects are stored per profile in the durable storage domain
  `project_sections`; session assignments live in the same domain.
- Deleting a project removes its session assignments but never deletes session
  logs.

## Surfaces

- **Left-rail Projects panel** (`sidebar.panellist` → `main` key `projects`):
  a projects browser that mimics the workspace tree — expand a project to see
  its sessions and **click a session to open it**, plus create/rename/delete,
  assign a recent session, move a session, remove a session, and **drag a
  session onto a project to assign it**.
- **Sidebar foot shortcut**: a **＋ New project** action opens the Projects
  panel.
- **Settings → Projects**: the same management view inside Settings.
- **Session rows**: a small colored dot in the leading cell marks the session's
  project; it is a **drag handle** — drag it onto a project in the Projects
  panel to assign (or move) the session.
- **JSON API** (same origin as the Web UI; deliberately outside `/api`, which the
  harness auth-gates):

  | Method | Path | Body | Result |
  |---|---|---|---|
  | GET | `/dsh-project-sections` | — | `{ projects, sessions, projectIds }` |
  | GET | `/dsh-project-sections/summary` | — | `{ projects, assignments }` |
  | POST | `/dsh-project-sections/create` | `{ name, color? }` | full snapshot |
  | POST | `/dsh-project-sections/rename` | `{ projectId, name }` | full snapshot |
  | POST | `/dsh-project-sections/delete` | `{ projectId }` | full snapshot |
  | POST | `/dsh-project-sections/assign` | `{ projectId, sessionId }` | full snapshot |
  | POST | `/dsh-project-sections/move` | `{ sessionId, projectId }` | full snapshot |
  | POST | `/dsh-project-sections/unassign` | `{ sessionId }` | full snapshot |

- **Agent tool** `project` with `action` = `list`/`create`/`rename`/`delete`/
  `assign`/`move`/`unassign`.

The same data is available to other plugins through the registry opened by the
plugin; it is not exposed as a separately named Cordis service.

## Limits

- Spend/cost tracking is **out of scope**: use the Token & Balance plugin.
- The assign picker offers the 50 most recent sessions; older sessions can still
  be moved from a project's own session list, or by id through the API.
- The project badge is a leading decoration and does not override row state
  dots; a non-idle row shows its status dot instead.
