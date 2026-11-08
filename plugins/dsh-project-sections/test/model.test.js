import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  DEFAULT_COLORS,
  pickColor,
  normalizeName,
  createProjectRecord,
  updateProjectName,
  validateProjectRecord,
  validateAssignmentRecord,
  validateDomainState,
  projectRecordSchema,
  assignmentRecordSchema,
  domainStateSchema,
} from '../src/model.js'

test('pickColor cycles the palette deterministically', () => {
  assert.equal(pickColor(0), DEFAULT_COLORS[0])
  assert.equal(pickColor(DEFAULT_COLORS.length), DEFAULT_COLORS[0])
  assert.equal(pickColor(2), DEFAULT_COLORS[2])
  assert.equal(pickColor(-1), DEFAULT_COLORS[0])
  assert.equal(pickColor('x'), DEFAULT_COLORS[0])
})

test('normalizeName trims and keeps blank as empty', () => {
  assert.equal(normalizeName('  Work  '), 'Work')
  assert.equal(normalizeName(undefined), '')
  assert.equal(normalizeName('   '), '')
})

test('createProjectRecord stamps both timestamps', () => {
  const record = createProjectRecord({ id: 'p1', name: 'Work', color: '#123456', now: '2026-11-08T00:00:00.000Z' })
  assert.deepEqual(record, {
    id: 'p1',
    name: 'Work',
    color: '#123456',
    createdAt: '2026-11-08T00:00:00.000Z',
    updatedAt: '2026-11-08T00:00:00.000Z',
  })
})

test('updateProjectName keeps createdAt and refreshes updatedAt', () => {
  const base = createProjectRecord({ id: 'p1', name: 'Work', color: '#123456', now: '2026-11-08T00:00:00.000Z' })
  const next = updateProjectName(base, 'Personal', '2026-11-09T00:00:00.000Z')
  assert.equal(next.name, 'Personal')
  assert.equal(next.createdAt, base.createdAt)
  assert.equal(next.updatedAt, '2026-11-09T00:00:00.000Z')
})

test('validateProjectRecord rejects malformed records', () => {
  assert.equal(validateProjectRecord({ id: 'p', name: 'n', color: '#fff', createdAt: 'a', updatedAt: 'b' }), null)
  assert.match(validateProjectRecord(null), /object/)
  assert.match(validateProjectRecord([]), /object/)
  assert.match(validateProjectRecord({ id: 1, name: 'n', color: '#fff', createdAt: 'a', updatedAt: 'b' }), /id/)
})

test('validateAssignmentRecord rejects malformed records', () => {
  assert.equal(validateAssignmentRecord({ projectId: 'p', assignedAt: 'a' }), null)
  assert.match(validateAssignmentRecord({}), /projectId/)
  assert.match(validateAssignmentRecord({ projectId: 'p' }), /assignedAt/)
})

test('validateDomainState requires a projectIds array', () => {
  assert.equal(validateDomainState({ projectIds: [] }), null)
  assert.match(validateDomainState({}), /projectIds/)
  assert.match(validateDomainState(null), /object/)
})

test('schemas expose parse and safeParse like zod', () => {
  assert.equal(projectRecordSchema.parse({ id: 'p', name: 'n', color: '#fff', createdAt: 'a', updatedAt: 'b' }).id, 'p')
  assert.equal(assignmentRecordSchema.safeParse({ projectId: 'p', assignedAt: 'a' }).success, true)
  assert.equal(domainStateSchema.safeParse({ projectIds: [] }).success, true)
  assert.equal(domainStateSchema.safeParse({}).success, false)
})
