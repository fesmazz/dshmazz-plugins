/**
 * Pure ordered-state operations for project sections. Everything takes and
 * returns plain objects/arrays so it can be unit-tested without a harness.
 */

/** Project records in durable order, skipping ids whose record is gone. */
export function orderedProjects(projectIds, getRecord) {
  const projects = []
  for (const id of projectIds) {
    const record = getRecord(id)
    if (record !== undefined) projects.push(record)
  }
  return projects
}

/** The project a session belongs to, if any. */
export function projectIdFor(assignments, sessionId) {
  const assignment = assignments[sessionId]
  return assignment ? assignment.projectId : undefined
}

/** Sessions currently assigned to one project. */
export function sessionIdsFor(assignments, projectId) {
  const ids = []
  for (const [sessionId, assignment] of Object.entries(assignments)) {
    if (assignment && assignment.projectId === projectId) ids.push(sessionId)
  }
  return ids
}

/** Node ids whose assignment points at a project that no longer exists. */
export function danglingSessionIds(assignments, projectIds) {
  const known = new Set(projectIds)
  const dangling = []
  for (const [sessionId, assignment] of Object.entries(assignments)) {
    if (assignment && !known.has(assignment.projectId)) dangling.push(sessionId)
  }
  return dangling
}

/**
 * Assign (or move) one session to a project. Returns a new assignments object;
 * an existing assignment for the same session is overwritten, which is what
 * "move chat to another project" means.
 */
export function assignSession(assignments, sessionId, projectId, assignedAt) {
  return { ...assignments, [sessionId]: { projectId, assignedAt } }
}

/** Drop one session's assignment. */
export function unassignSession(assignments, sessionId) {
  if (!(sessionId in assignments)) return assignments
  const next = { ...assignments }
  delete next[sessionId]
  return next
}

/** Drop every assignment that points at a deleted project. */
export function removeProjectAssignments(assignments, projectId) {
  const next = {}
  for (const [sessionId, assignment] of Object.entries(assignments)) {
    if (assignment && assignment.projectId !== projectId) next[sessionId] = assignment
  }
  return next
}

/** Remove one id from the durable order. */
export function removeProjectId(projectIds, projectId) {
  return projectIds.filter((id) => id !== projectId)
}
