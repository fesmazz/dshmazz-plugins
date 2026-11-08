/**
 * Pure model for project sections: record shapes, validators, and helpers.
 *
 * No harness imports: this module runs under `node --test` and is also loaded
 * by the Host half at runtime.
 */

/** Default palette; a project without an explicit color picks one by index. */
export const DEFAULT_COLORS = [
  '#3b82f6',
  '#22c55e',
  '#eab308',
  '#ef4444',
  '#a855f7',
  '#14b8a6',
  '#f97316',
  '#ec4899',
  '#6366f1',
  '#84cc16',
]

/** Deterministic palette choice so ordering is stable and testable. */
export function pickColor(index) {
  const n = Number.isInteger(index) && index >= 0 ? index : 0
  return DEFAULT_COLORS[n % DEFAULT_COLORS.length]
}

/** Trim a proposed project name; blank names are rejected by the callers. */
export function normalizeName(value) {
  return String(value ?? '').trim()
}

/** Build a fresh durable project record. */
export function createProjectRecord({ id, name, color, now }) {
  const createdAt = now ?? new Date().toISOString()
  return { id, name, color, createdAt, updatedAt: createdAt }
}

/** Return a renamed copy of a project record. */
export function updateProjectName(record, name, now) {
  return { ...record, name, updatedAt: now ?? new Date().toISOString() }
}

/**
 * Minimal zod-compatible schema wrapper. The storage domain only calls
 * `parse(value)` and `safeParse(value)`; this avoids importing zod from a
 * profile-linked plugin.
 */
function schema(validate) {
  return {
    parse(value) {
      const problem = validate(value)
      if (problem) throw new Error(problem)
      return value
    },
    safeParse(value) {
      try {
        const problem = validate(value)
        return problem
          ? { success: false, error: new Error(problem) }
          : { success: true, data: value }
      } catch (error) {
        return { success: false, error }
      }
    },
  }
}

/** Validate one durable project record. */
export function validateProjectRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return 'project record must be an object'
  }
  for (const key of ['id', 'name', 'color', 'createdAt', 'updatedAt']) {
    if (typeof value[key] !== 'string') return `project record.${key} must be a string`
  }
  return null
}

/** Validate one session→project assignment record. */
export function validateAssignmentRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return 'assignment record must be an object'
  }
  if (typeof value.projectId !== 'string') return 'assignment record.projectId must be a string'
  if (typeof value.assignedAt !== 'string') return 'assignment record.assignedAt must be a string'
  return null
}

/** Validate the durable ordered-project state. */
export function validateDomainState(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return 'domain state must be an object'
  }
  if (!Array.isArray(value.projectIds)) return 'domain state.projectIds must be an array'
  return null
}

/** The project table schema. */
export const projectRecordSchema = schema(validateProjectRecord)

/** The assignment table schema. */
export const assignmentRecordSchema = schema(validateAssignmentRecord)

/** The domain global schema. */
export const domainStateSchema = schema(validateDomainState)
