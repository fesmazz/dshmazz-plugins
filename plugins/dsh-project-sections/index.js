/**
 * Host half of the Project Sections plugin.
 *
 * Groups sessions into named projects (sections) that are independent of
 * workspace folders, so several projects can share one root directory. A
 * session belongs to at most one project and can be moved between them.
 *
 * Serves same-origin JSON routes the Client half uses (all outside `/api`,
 * which the harness auth-gates):
 *
 *   GET  /dsh-project-sections
 *   POST /dsh-project-sections/create | rename | delete | assign | move | unassign
 *
 * Spend/cost tracking is intentionally out of scope here; that belongs to the
 * Token & Balance plugin.
 *
 * A profile-linked plugin must not import `@deepseek-ai/*`; every service is
 * reached through the Cordis `ctx` at runtime.
 */

import { randomUUID } from 'node:crypto'

import {
  createProjectRecord,
  normalizeName,
  pickColor,
  updateProjectName,
  projectRecordSchema,
  assignmentRecordSchema,
  domainStateSchema,
} from './src/model.js'
import {
  orderedProjects,
  projectIdFor,
  sessionIdsFor,
  removeProjectId,
} from './src/ops.js'

/** Cordis plugin name. */
export const name = 'project-sections'

/** The HTTP carrier and the durable registry backend are required. */
export const inject = ['webServer', 'storageDomain']

const API = '/dsh-project-sections'

const projectsDomain = {
  name: 'project_sections',
  version: 1,
  global: {
    schema: domainStateSchema,
    initial: { projectIds: [] },
  },
  tables: {
    projects: { valueSchema: projectRecordSchema },
    sessionassignments: { valueSchema: assignmentRecordSchema },
  },
}

/** The registry: one durable ordered list of projects plus session assignments. */
class ProjectRegistry {
  constructor(ctx) {
    this.ctx = ctx
    this.readyPromise = null
    this.closing = false
    this.domain = null
    this.table = null
    this.sessionTable = null
    this.global = null
  }

  start() {
    if (!this.readyPromise) this.readyPromise = this.openDomain()
    return this.readyPromise
  }

  async openDomain() {
    let attempt = 0
    for (;;) {
      try {
        const domain = await this.ctx.storageDomain.open(projectsDomain)
        if (this.closing) {
          // Disposed while the open was in flight: never leak the domain name.
          await domain.close()
          throw new Error('project registry was disposed before it finished opening')
        }
        this.domain = domain
        this.table = domain.table('projects')
        this.sessionTable = domain.table('sessionassignments')
        this.global = domain.global
        return
      } catch (error) {
        const message = String((error && error.message) || error)
        const alreadyOpen = (error && error.code === 'already-open') || message.includes('already open')
        if (!this.closing && alreadyOpen && attempt < 10) {
          attempt += 1
          await new Promise((resolve) => setTimeout(resolve, 200))
          continue
        }
        throw error
      }
    }
  }

  async ready() {
    await this.start()
  }

  async close() {
    this.closing = true
    const domain = this.domain
    this.domain = null
    this.table = null
    this.sessionTable = null
    this.global = null
    if (domain) await domain.close()
  }

  assertReady() {
    if (!this.table || !this.sessionTable || !this.global) throw new Error('project registry is not ready yet')
  }

  /** Ordered project records. */
  list() {
    this.assertReady()
    const state = this.global.get()
    return orderedProjects(state.projectIds, (id) => this.table.get(id))
  }

  get(id) {
    this.assertReady()
    return this.table.get(id)
  }

  /** All session→project assignments as a plain object. */
  assignments() {
    this.assertReady()
    const out = {}
    for (const [sessionId, record] of this.sessionTable.entries()) out[sessionId] = record
    return out
  }

  async create(rawName, color) {
    await this.ready()
    const projectName = normalizeName(rawName)
    if (!projectName) throw new Error('project name must be non-blank')
    const state = this.global.get()
    const id = randomUUID()
    const record = createProjectRecord({
      id,
      name: projectName,
      color: color || pickColor(state.projectIds.length),
    })
    await this.table.put(id, record)
    try {
      await this.global.set({ projectIds: [id, ...state.projectIds] })
    } catch (error) {
      try {
        await this.table.delete(id)
      } catch {}
      throw error
    }
    return record
  }

  async rename(id, rawName) {
    await this.ready()
    const projectName = normalizeName(rawName)
    if (!projectName) throw new Error('project name must be non-blank')
    const current = this.table.get(id)
    if (!current) throw new Error(`unknown project '${id}'`)
    return await this.table.update(id, (record) => updateProjectName(record, projectName))
  }

  async remove(id) {
    await this.ready()
    if (!this.table.get(id)) throw new Error(`unknown project '${id}'`)
    const assignments = this.assignments()
    for (const [sessionId, record] of Object.entries(assignments)) {
      if (record.projectId === id) await this.sessionTable.delete(sessionId)
    }
    const state = this.global.get()
    await this.global.set({ projectIds: removeProjectId(state.projectIds, id) })
    await this.table.delete(id)
  }

  /** Assign a session to a project, replacing any current assignment (i.e. a move). */
  async assign(projectId, sessionId) {
    await this.ready()
    if (!sessionId) throw new Error('assign requires a session id')
    if (!this.table.get(projectId)) throw new Error(`unknown project '${projectId}'`)
    await this.sessionTable.put(sessionId, { projectId, assignedAt: new Date().toISOString() })
  }

  /** Move a session to another project (explicit alias used by the UI). */
  async move(sessionId, projectId) {
    return await this.assign(projectId, sessionId)
  }

  async unassign(sessionId) {
    await this.ready()
    if (!sessionId) throw new Error('unassign requires a session id')
    await this.sessionTable.delete(sessionId)
  }

  /** Recent session ids for the picker, newest-first when sessionQuery exists. */
  async sessionIds() {
    const query = this.ctx.get('sessionQuery')
    if (query && typeof query.listSessions === 'function') {
      try {
        const records = await query.listSessions()
        return (Array.isArray(records) ? records : [])
          .map((record) => record && record.header && record.header.id)
          .filter((id) => typeof id === 'string')
      } catch {
        // fall through to live sessions
      }
    }
    const sessions = this.ctx.get('sessions')
    return sessions ? sessions.list().map((session) => session.id) : []
  }

  async titlesFor(ids) {
    if (ids.length === 0) return new Map()
    const query = this.ctx.get('sessionQuery')
    if (query && typeof query.readTitleSnapshots === 'function') {
      try {
        const results = await query.readTitleSnapshots(ids)
        const titles = new Map()
        for (const result of Array.isArray(results) ? results : []) {
          if (result.status === 'fulfilled') titles.set(result.sessionId, result.value?.title?.title || 'untitled')
          else titles.set(result.sessionId, 'untitled')
        }
        return titles
      } catch {
        // fall through
      }
    }
    return new Map()
  }

  /** Full state for the Web UI: projects with their sessions, plus a recent picker. */
  async snapshot() {
    await this.ready()
    const assignments = this.assignments()
    const allIds = await this.sessionIds()
    const projectIds = this.list().map((project) => project.id)
    const assignedIds = new Set(Object.keys(assignments))
    const recentIds = allIds.slice(0, 50)
    const titleIds = [...new Set([...recentIds, ...assignedIds])]
    const titles = await this.titlesFor(titleIds)
    const titleOf = (id) => titles.get(id) || 'untitled'

    const projects = this.list().map((project) => {
      const sessionIds = sessionIdsFor(assignments, project.id)
      return {
        id: project.id,
        name: project.name,
        color: project.color,
        createdAt: project.createdAt,
        sessions: sessionIds.map((sessionId) => ({ sessionId, title: titleOf(sessionId) })),
      }
    })

    const sessions = recentIds.map((id) => ({
      id,
      title: titleOf(id),
      projectId: projectIdFor(assignments, id) || null,
    }))

    return { projects, sessions, projectIds }
  }

  /** Lightweight projection for the per-row badges: projects plus assignments. */
  async summary() {
    await this.ready()
    const assignments = this.assignments()
    return {
      projects: this.list().map((project) => ({ id: project.id, name: project.name, color: project.color })),
      assignments: Object.fromEntries(
        Object.entries(assignments).map(([sessionId, record]) => [sessionId, record.projectId]),
      ),
    }
  }
}

function writeJson(res, status, body) {
  const text = JSON.stringify(body)
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(text) })
  res.end(text)
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.setEncoding('utf8')
    req.on('data', (chunk) => {
      data += chunk
      if (data.length > 1e6) {
        reject(new Error('request body too large'))
        req.destroy()
      }
    })
    req.on('end', () => {
      if (!data) return resolve({})
      try {
        resolve(JSON.parse(data))
      } catch {
        reject(new Error('invalid JSON body'))
      }
    })
    req.on('error', reject)
  })
}

export function apply(ctx) {
  const registry = new ProjectRegistry(ctx)
  registry.start().catch((error) => {
    ctx.logger.error(`project-sections: failed to open project domain: ${String(error)}`)
  })
  ctx.effect(() => () => registry.close(), 'project-sections: registry')

  const routes = [
    {
      method: 'GET',
      path: API,
      handler: async () => await registry.snapshot(),
    },
    {
      method: 'GET',
      path: `${API}/summary`,
      handler: async () => await registry.summary(),
    },
    {
      method: 'POST',
      path: `${API}/create`,
      handler: async (body) => {
        await registry.create(body.name, body.color)
        return await registry.snapshot()
      },
    },
    {
      method: 'POST',
      path: `${API}/rename`,
      handler: async (body) => {
        await registry.rename(body.projectId, body.name)
        return await registry.snapshot()
      },
    },
    {
      method: 'POST',
      path: `${API}/delete`,
      handler: async (body) => {
        await registry.remove(body.projectId)
        return await registry.snapshot()
      },
    },
    {
      method: 'POST',
      path: `${API}/assign`,
      handler: async (body) => {
        await registry.assign(body.projectId, body.sessionId)
        return await registry.snapshot()
      },
    },
    {
      method: 'POST',
      path: `${API}/move`,
      handler: async (body) => {
        await registry.move(body.sessionId, body.projectId)
        return await registry.snapshot()
      },
    },
    {
      method: 'POST',
      path: `${API}/unassign`,
      handler: async (body) => {
        await registry.unassign(body.sessionId)
        return await registry.snapshot()
      },
    },
  ]

  for (const route of routes) {
    ctx.effect(
      () =>
        ctx.webServer.register({
          kind: 'exact',
          path: route.path,
          handler: async (req, res) => {
            if (req.method !== route.method) {
              writeJson(res, 405, { error: `method ${String(req.method)} is not allowed` })
              return
            }
            try {
              const body = route.method === 'POST' ? await readJsonBody(req) : {}
              writeJson(res, 200, await route.handler(body))
            } catch (error) {
              writeJson(res, 400, { error: error && error.message ? error.message : String(error) })
            }
          },
        }),
      `project-sections: route ${route.path}`,
    )
  }

  // Optional agent-facing tool (present in profiles that mount the tool registry).
  const tools = ctx.get('tools')
  if (tools && typeof tools.register === 'function') {
    tools.register({
      name: 'project',
      description:
        'Manage project sections: create, list, rename, delete projects, and assign, move, or unassign sessions. Projects group sessions independently of workspace folders.',
      parameters: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['list', 'create', 'rename', 'delete', 'assign', 'move', 'unassign'],
            description: 'Operation to perform.',
          },
          name: { type: 'string', description: 'Project name (create/rename).' },
          color: { type: 'string', description: "Optional hex color for create, e.g. '#3b82f6'." },
          project_id: { type: 'string', description: 'Project id (rename/delete/assign/move).' },
          session_id: {
            type: 'string',
            description: 'Session id (assign/move/unassign). Omit to use the current conversation.',
          },
        },
        required: ['action'],
      },
      output: {
        schema: { type: 'string' },
        render: (_args, value) => [{ type: 'text', text: value }],
      },
      execute: async (args, exec) => {
        const callerId = exec && exec.agent ? exec.agent.session.id : undefined
        switch (args.action) {
          case 'list': {
            const state = await registry.snapshot()
            if (state.projects.length === 0) return 'No projects yet. Use action=create to make one.'
            const lines = [`Projects (${state.projects.length}):`]
            for (const project of state.projects) {
              lines.push('', `${project.name} (id: ${project.id})`, `  sessions: ${project.sessions.length}`)
            }
            return lines.join('\n')
          }
          case 'create': {
            const project = await registry.create(args.name, args.color)
            return `Created project "${project.name}" (id: ${project.id}, color: ${project.color}).`
          }
          case 'rename': {
            const project = await registry.rename(args.project_id, args.name)
            return `Renamed project to "${project.name}" (id: ${project.id}).`
          }
          case 'delete': {
            await registry.remove(args.project_id)
            return `Deleted project (id: ${args.project_id}).`
          }
          case 'assign': {
            const sessionId = args.session_id || callerId
            if (!sessionId) throw new Error('assign requires a session_id or a current session')
            await registry.assign(args.project_id, sessionId)
            return `Assigned session ${sessionId} to project "${registry.get(args.project_id).name}".`
          }
          case 'move': {
            const sessionId = args.session_id || callerId
            if (!sessionId) throw new Error('move requires a session_id or a current session')
            await registry.move(sessionId, args.project_id)
            return `Moved session ${sessionId} to project "${registry.get(args.project_id).name}".`
          }
          case 'unassign': {
            const sessionId = args.session_id || callerId
            if (!sessionId) throw new Error('unassign requires a session_id or a current session')
            await registry.unassign(sessionId)
            return `Removed session ${sessionId} from its project.`
          }
          default:
            throw new Error(`unknown project action '${args.action}'`)
        }
      },
    })
  }
}
