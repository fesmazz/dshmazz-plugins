import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  orderedProjects,
  projectIdFor,
  sessionIdsFor,
  danglingSessionIds,
  assignSession,
  unassignSession,
  removeProjectAssignments,
  removeProjectId,
} from '../src/ops.js'

const records = {
  a: { id: 'a', name: 'Alpha' },
  b: { id: 'b', name: 'Beta' },
}

test('orderedProjects follows ids and skips missing records', () => {
  assert.deepEqual(orderedProjects(['b', 'missing', 'a'], (id) => records[id]).map((r) => r.id), ['b', 'a'])
})

test('projectIdFor reads the assignment', () => {
  const assignments = { s1: { projectId: 'a', assignedAt: 't' } }
  assert.equal(projectIdFor(assignments, 's1'), 'a')
  assert.equal(projectIdFor(assignments, 's2'), undefined)
})

test('sessionIdsFor lists sessions in stable object order', () => {
  const assignments = {
    s1: { projectId: 'a', assignedAt: 't' },
    s2: { projectId: 'b', assignedAt: 't' },
    s3: { projectId: 'a', assignedAt: 't' },
  }
  assert.deepEqual(sessionIdsFor(assignments, 'a'), ['s1', 's3'])
})

test('danglingSessionIds reports assignments to unknown projects', () => {
  const assignments = {
    s1: { projectId: 'a', assignedAt: 't' },
    s2: { projectId: 'gone', assignedAt: 't' },
  }
  assert.deepEqual(danglingSessionIds(assignments, ['a']), ['s2'])
})

test('assignSession overwrites an existing assignment (move)', () => {
  const before = { s1: { projectId: 'a', assignedAt: 't1' } }
  const after = assignSession(before, 's1', 'b', 't2')
  assert.equal(after.s1.projectId, 'b')
  assert.equal(after.s1.assignedAt, 't2')
  assert.equal(before.s1.projectId, 'a', 'input must not be mutated')
})

test('assignSession adds a new assignment', () => {
  const after = assignSession({}, 's9', 'b', 't')
  assert.deepEqual(after, { s9: { projectId: 'b', assignedAt: 't' } })
})

test('unassignSession removes only the named session', () => {
  const before = {
    s1: { projectId: 'a', assignedAt: 't' },
    s2: { projectId: 'b', assignedAt: 't' },
  }
  assert.deepEqual(Object.keys(unassignSession(before, 's1')), ['s2'])
  assert.equal(unassignSession(before, 'absent'), before, 'no-op returns the same reference')
})

test('removeProjectAssignments drops assignments for a deleted project', () => {
  const before = {
    s1: { projectId: 'a', assignedAt: 't' },
    s2: { projectId: 'b', assignedAt: 't' },
    s3: { projectId: 'a', assignedAt: 't' },
  }
  const after = removeProjectAssignments(before, 'a')
  assert.deepEqual(Object.keys(after), ['s2'])
})

test('removeProjectId filters the durable order', () => {
  assert.deepEqual(removeProjectId(['a', 'b', 'c'], 'b'), ['a', 'c'])
  assert.deepEqual(removeProjectId(['a'], 'missing'), ['a'])
})
