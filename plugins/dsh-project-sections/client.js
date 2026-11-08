window.__ModuleLoader__.load({
  id: '@fesmazz/dsh-project-sections',
  factory(require) {
    const React = require('react')
    const { useState, useEffect, useCallback } = React
    const h = React.createElement
    const API = '/dsh-project-sections'
    const DRAG_TYPE = 'application/x-dsh-project-session'
    const TAB_ID = '@fesmazz/dsh-project-sections/projects'
    const TAB_KIND = 'project-sections-projects'

    const t = {
      text: 'var(--dsw-alias-label-primary, currentColor)',
      textSecondary: 'var(--dsw-alias-label-secondary, #6b7280)',
      bgLayer1: 'var(--dsw-alias-bg-layer-1, transparent)',
      bgLayer2: 'var(--dsw-alias-bg-layer-2, transparent)',
      border: 'var(--dsw-alias-border-l1, rgba(128,128,128,0.3))',
      brand: 'var(--dsw-alias-brand-primary, #3b82f6)',
      danger: 'var(--dsw-alias-state-error-primary, #ef4444)',
    }

    async function api(method, path, body) {
      const res = await fetch(API + path, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      })
      let payload = null
      try {
        payload = await res.json()
      } catch {}
      if (!res.ok) throw new Error((payload && payload.error) || res.statusText || 'request failed')
      return payload
    }

    function Dot({ color, size = 10, title }) {
      return h('span', {
        title,
        'aria-hidden': title ? undefined : true,
        style: {
          display: 'inline-block',
          width: size,
          height: size,
          borderRadius: '50%',
          background: color || '#9ca3af',
          flexShrink: 0,
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)',
        },
      })
    }

    function Button({ label, onClick, disabled, kind }) {
      const primary = kind === 'primary'
      const danger = kind === 'danger'
      return h(
        'button',
        {
          type: 'button',
          onClick,
          disabled,
          style: {
            cursor: disabled ? 'default' : 'pointer',
            padding: '4px 10px',
            borderRadius: 6,
            border: `1px solid ${danger ? t.danger : t.border}`,
            background: primary ? t.brand : 'transparent',
            color: primary ? '#ffffff' : danger ? t.danger : t.text,
            opacity: disabled ? 0.5 : 1,
            fontSize: 12,
            whiteSpace: 'nowrap',
          },
        },
        label,
      )
    }

    function TextInput({ value, onChange, placeholder, style }) {
      return h('input', {
        type: 'text',
        value,
        placeholder,
        onChange: (e) => onChange(e.target.value),
        style: {
          padding: '5px 8px',
          borderRadius: 6,
          border: `1px solid ${t.border}`,
          background: t.bgLayer2,
          color: t.text,
          fontSize: 13,
          boxSizing: 'border-box',
          ...style,
        },
      })
    }

    function Select({ value, onChange, options, style }) {
      return h(
        'select',
        {
          value,
          onChange: (e) => onChange(e.target.value),
          style: {
            padding: '4px 8px',
            borderRadius: 6,
            border: `1px solid ${t.border}`,
            background: t.bgLayer2,
            color: t.text,
            fontSize: 12,
            boxSizing: 'border-box',
            ...style,
          },
        },
        options.map((option) => h('option', { key: option.value, value: option.value }, option.label)),
      )
    }

    /** Left-rail panel icon. */
    function ProjectsIcon(props) {
      const size = props.size || 20
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': true },
        h('path', {
          fill: 'currentColor',
          d: 'M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z',
        }),
      )
    }

    // One shared snapshot fetch (short TTL) feeds every session-row badge, so a
    // sidebar with hundreds of rows does not issue hundreds of requests.
    let badgeCache = null
    let badgeAt = 0
    let badgePromise = null
    function loadBadgeMap() {
      if (badgeCache && Date.now() - badgeAt < 3000) return Promise.resolve(badgeCache)
      if (badgePromise) return badgePromise
      badgePromise = api('GET', '/summary')
        .then((summary) => {
          const byProject = new Map()
          for (const project of summary.projects || []) byProject.set(project.id, project)
          const map = new Map()
          for (const [sessionId, projectId] of Object.entries(summary.assignments || {})) {
            const project = byProject.get(projectId)
            if (project) map.set(sessionId, { projectId, name: project.name, color: project.color })
          }
          badgeCache = map
          badgeAt = Date.now()
          return map
        })
        .finally(() => {
          badgePromise = null
        })
      return badgePromise
    }

    /** Draggable project badge on each session row; drag onto a project to assign. */
    function ProjectBadge(props) {
      const [assignment, setAssignment] = useState(null)
      useEffect(() => {
        let alive = true
        loadBadgeMap()
          .then((map) => {
            if (alive) setAssignment(map.get(props.sessionId) || null)
          })
          .catch(() => {
            if (alive) setAssignment(null)
          })
        return () => {
          alive = false
        }
      }, [props.sessionId])

      return h(
        'span',
        {
          draggable: true,
          title: assignment ? `${assignment.name} — drag to a project to move` : 'Drag to a project',
          onDragStart: (e) => {
            e.dataTransfer.setData(DRAG_TYPE, props.sessionId)
            e.dataTransfer.setData('text/plain', props.sessionId)
            e.dataTransfer.effectAllowed = 'move'
          },
          style: {
            display: 'inline-flex',
            alignItems: 'center',
            cursor: 'grab',
            width: 14,
            height: 14,
          },
        },
        assignment ? h(Dot, { color: assignment.color, size: 9 }) : h(Dot, { color: '#9ca3af', size: 7 }),
      )
    }

    function ProjectsView(props) {
      const openSession = props.openSession
      const [state, setState] = useState(null)
      const [error, setError] = useState(null)
      const [busy, setBusy] = useState(false)
      const [newName, setNewName] = useState('')
      const [newColor, setNewColor] = useState('')
      const [expanded, setExpanded] = useState({})
      const [editing, setEditing] = useState(null)
      const [editName, setEditName] = useState('')
      const [assigning, setAssigning] = useState(null)
      const [assignSession, setAssignSession] = useState('')
      const [dropHover, setDropHover] = useState(null)

      const load = useCallback(async () => {
        try {
          setState(await api('GET', ''))
          setError(null)
        } catch (e) {
          setError(String((e && e.message) || e))
        }
      }, [])

      useEffect(() => {
        load()
      }, [load])

      async function run(fn) {
        setBusy(true)
        setError(null)
        try {
          await fn()
          badgeCache = null
          await load()
        } catch (e) {
          setError(String((e && e.message) || e))
        } finally {
          setBusy(false)
        }
      }

      function toggle(id) {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
      }

      function dropSession(projectId, e) {
        e.preventDefault()
        const sessionId = e.dataTransfer.getData(DRAG_TYPE) || e.dataTransfer.getData('text/plain')
        setDropHover(null)
        if (sessionId) run(async () => api('POST', '/assign', { projectId, sessionId }))
      }

      if (error) {
        return h('div', { style: { padding: 16, color: t.danger, fontSize: 13 } }, 'Project Sections error: ' + error)
      }
      if (!state) {
        return h('div', { style: { padding: 16, color: t.textSecondary, fontSize: 13 } }, 'Loading projects…')
      }

      const projectOptions = (excludeId) =>
        state.projects.filter((p) => p.id !== excludeId).map((p) => ({ value: p.id, label: p.name }))

      const unassigned = state.sessions.filter((s) => s.projectId === null)

      return h(
        'div',
        { style: { padding: 16, color: t.text, fontSize: 13, lineHeight: 1.5, overflowY: 'auto' } },

        h('div', { style: { fontSize: 15, fontWeight: 600, marginBottom: 12 } }, 'Projects'),

        // Create row
        h(
          'div',
          { style: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' } },
          h(TextInput, { value: newName, onChange: setNewName, placeholder: 'New project name', style: { flex: '1 1 160px' } }),
          h(TextInput, { value: newColor, onChange: setNewColor, placeholder: 'Color (optional) #3b82f6', style: { flex: '1 1 120px' } }),
          h(Button, {
            label: 'Create project',
            kind: 'primary',
            disabled: busy || !newName.trim(),
            onClick: () =>
              run(async () => {
                await api('POST', '/create', { name: newName.trim(), color: newColor.trim() || undefined })
                setNewName('')
                setNewColor('')
              }),
          }),
        ),

        state.projects.length === 0
          ? h(
              'div',
              { style: { color: t.textSecondary } },
              'No projects yet. Create one above, then drag a session from the sidebar onto a project, or use "Assign session…" below.',
            )
          : state.projects.map((project) => {
              const open = !!expanded[project.id]
              const isEditing = editing === project.id
              const highlighted = dropHover === project.id
              return h(
                'div',
                {
                  key: project.id,
                  onDragOver: (e) => {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = 'move'
                    if (dropHover !== project.id) setDropHover(project.id)
                  },
                  onDragLeave: (e) => {
                    if (dropHover === project.id) setDropHover(null)
                  },
                  onDrop: (e) => dropSession(project.id, e),
                  style: {
                    border: `1px solid ${highlighted ? t.brand : t.border}`,
                    borderRadius: 8,
                    marginBottom: 10,
                    background: highlighted ? 'var(--dsw-alias-bg-layer-2, rgba(0,0,0,0.04))' : t.bgLayer1,
                    padding: 10,
                    boxShadow: highlighted ? `0 0 0 1px ${t.brand}` : undefined,
                  },
                },
                h(
                  'div',
                  { style: { display: 'flex', gap: 8, alignItems: 'center' } },
                  h(Dot, { color: project.color, size: 12 }),
                  isEditing
                    ? h(TextInput, { value: editName, onChange: setEditName, style: { flex: '1 1 auto' } })
                    : h(
                        'span',
                        { style: { fontWeight: 600, flex: '1 1 auto', cursor: 'pointer' }, onClick: () => toggle(project.id) },
                        project.name,
                      ),
                  h('span', { style: { color: t.textSecondary, fontSize: 12 } }, `${project.sessions.length} session${project.sessions.length === 1 ? '' : 's'}`),
                  isEditing
                    ? h(Button, {
                        label: 'Save',
                        disabled: busy,
                        onClick: () =>
                          run(async () => {
                            await api('POST', '/rename', { projectId: project.id, name: editName })
                            setEditing(null)
                          }),
                      })
                    : h(Button, {
                        label: 'Rename',
                        disabled: busy,
                        onClick: () => {
                          setEditing(project.id)
                          setEditName(project.name)
                        },
                      }),
                  h(Button, {
                    label: 'Delete',
                    kind: 'danger',
                    disabled: busy,
                    onClick: () => run(async () => api('POST', '/delete', { projectId: project.id })),
                  }),
                ),
                open
                  ? h(
                      'div',
                      { style: { marginTop: 10, paddingLeft: 20 } },
                      project.sessions.length === 0
                        ? h('div', { style: { color: t.textSecondary, fontSize: 12 } }, 'No sessions assigned. Drag a session here or assign one below.')
                        : project.sessions.map((session) =>
                            h(
                              'div',
                              { key: session.sessionId, style: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' } },
                              h(
                                'button',
                                {
                                  type: 'button',
                                  onClick: () => openSession && openSession(session.sessionId),
                                  title: 'Open this session',
                                  style: {
                                    flex: '1 1 160px',
                                    fontSize: 12,
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    color: t.text,
                                    textDecoration: 'underline',
                                    textUnderlineOffset: 2,
                                  },
                                },
                                session.title,
                              ),
                              projectOptions(project.id).length > 0
                                ? h(Select, {
                                    value: '',
                                    onChange: (value) => {
                                      if (value) run(async () => api('POST', '/move', { sessionId: session.sessionId, projectId: value }))
                                    },
                                    options: [{ value: '', label: 'Move to…' }, ...projectOptions(project.id)],
                                  })
                                : null,
                              h(Button, {
                                label: 'Remove',
                                kind: 'danger',
                                disabled: busy,
                                onClick: () => run(async () => api('POST', '/unassign', { sessionId: session.sessionId })),
                              }),
                            ),
                          ),
                      assigning === project.id
                        ? h(
                            'div',
                            { style: { display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 } },
                            unassigned.length === 0
                              ? h('span', { style: { color: t.textSecondary, fontSize: 12 } }, 'No unassigned recent sessions.')
                              : h(Select, {
                                  value: assignSession,
                                  onChange: setAssignSession,
                                  options: [
                                    { value: '', label: 'Select a session…' },
                                    ...unassigned.map((s) => ({ value: s.id, label: s.title })),
                                  ],
                                  style: { flex: '1 1 auto' },
                                }),
                            h(Button, {
                              label: 'Assign',
                              kind: 'primary',
                              disabled: busy || !assignSession,
                              onClick: () =>
                                run(async () => {
                                  await api('POST', '/assign', { projectId: project.id, sessionId: assignSession })
                                  setAssignSession('')
                                  setAssigning(null)
                                }),
                            }),
                          )
                        : h(Button, { label: 'Assign session…', disabled: busy, onClick: () => setAssigning(project.id) }),
                    )
                  : null,
              )
            }),
      )
    }

    return {
      inject: ['slots', 'sidebarRightTabs'],
      apply(ctx) {
        const uiWorkspace = ctx.get('uiWorkspace')
        const openSession = (sessionId) => {
          if (uiWorkspace && typeof uiWorkspace.openSession === 'function') uiWorkspace.openSession(sessionId)
        }
        const layout = ctx.get('layout')
        const openProjectsPanel = () => {
          if (layout && typeof layout.selectPanel === 'function') layout.selectPanel('projects')
        }
        const ProjectsPanel = (props) => h(ProjectsView, { ...props, openSession })
        const NewProjectAction = (props) =>
          h(
            'button',
            {
              type: 'button',
              title: 'New project',
              onClick: openProjectsPanel,
              style: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
                background: 'none',
                border: `1px solid ${t.border}`,
                borderRadius: 6,
                color: t.text,
                padding: '4px 8px',
                fontSize: 12,
                whiteSpace: 'nowrap',
              },
            },
            props.wide ? '＋ New project' : '＋',
          )

        ctx.slots.inject('sidebar.panellist', () =>
          ctx.slots.register({ name: 'sidebar.panellist', id: 'projects', order: 5, label: 'Projects' }, ProjectsIcon),
        )
        ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'projects' }, ProjectsPanel))
        ctx.slots.inject('settings.section', () =>
          ctx.slots.register({ name: 'settings.section', id: 'projects', order: 25, label: 'Projects' }, ProjectsPanel),
        )
        ctx.slots.inject('sidebar.session.row.leading', () =>
          ctx.slots.register({ name: 'sidebar.session.row.leading', id: 'project-mark', order: 5 }, ProjectBadge),
        )
        ctx.slots.inject('sidebar.footer.action', () =>
          ctx.slots.register({ name: 'sidebar.footer.action', id: 'new-project', order: 10, label: 'New project' }, NewProjectAction),
        )

        // Right-sidebar "Projects" tab: a persistent, always-reachable browser.
        ctx.effect(
          () =>
            ctx.sidebarRightTabs.register({
              id: TAB_ID,
              kind: TAB_KIND,
              title: () => 'Projects',
            }),
          'project-sections: projects tab type',
        )
        ctx.effect(
          () =>
            ctx.slots.inject('sidebar.right.pane.tab', () =>
              ctx.slots.register({ name: 'sidebar.right.pane.tab', key: TAB_ID }, ProjectsPanel),
            ),
          'project-sections: projects tab body',
        )
      },
    }
  },
})
