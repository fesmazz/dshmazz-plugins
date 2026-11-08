window.__ModuleLoader__.load({
  id: '@fesmazz/dsh-delegation-models',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'dsh-delegation-models'
    const PAGE_ID = 'delegation-models'
    const PANEL_ID = '@fesmazz/dsh-delegation-models/panel'
    const PANEL_KIND = 'delegation-models-panel'

    const en = {
      'page.label': 'Delegation Models',
      'page.title': 'Delegation Models',
      'page.sub': 'Global profiles for agent-team and subagent work; sessions can override them from the right-sidebar panel.',
      'tab.profiles': 'Profiles',
      'tab.rates': 'Rates',
      'tab.source': 'Auto-configure',
      'profiles.add': '+ Add profile',
      'profiles.save': 'Save global defaults',
      'profiles.agentType': 'Agent type',
      'profiles.taskType': 'Task type',
      'profiles.tier': 'Model tier',
      'profiles.route': 'Route',
      'profiles.effort': 'Effort',
      'profiles.default': 'Default profile',
      'profiles.empty': 'No profiles yet. Add one, or use Auto-configure.',
      'profiles.saved': 'Saved.',
      'rates.title': 'Rate card',
      'rates.sub': 'Cost estimates use this card; the bundled snapshot is only a starting point.',
      'rates.save': 'Save rates',
      'rates.bundled': 'Use bundled snapshot',
      'rates.add': '+ Add model',
      'rates.custom': 'Custom JSON',
      'rates.applyJson': 'Apply JSON',
      'rates.saved': 'Rates saved.',
      'source.title': 'Auto-configure from a file or paste',
      'source.sub': 'The agent maps rules to the bundled categories; the source is remembered and re-applied when it changes.',
      'source.paste': 'Paste rules',
      'source.file': 'Choose file',
      'source.save': 'Save source',
      'source.parse': 'Parse with agent',
      'source.auto': 'Re-apply when the source changes',
      'source.saved': 'Source saved.',
      'source.parsePending': 'Agent parsing lands in the next build step.',
      'source.parsing': 'Parsing…',
      'source.apply': 'Apply profiles',
      'source.proposals': 'Parsed proposals',
      'source.applied': 'Last applied',
      'panel.title': 'Delegation models',
      'panel.inherit': 'Inherits the global defaults. Changes here apply to this session only.',
      'panel.override': 'Override',
      'panel.useGlobal': 'Use global',
      'panel.apply': 'Apply to session',
      'panel.reset': 'Reset to global',
      'panel.empty': 'No global profiles yet. Add them under Plugins → Delegation Models.',
      'panel.note': 'Teammates inherit the Lead model until V1.2; overrides apply to delegate_model and subagents.',
      'usage.title': 'Session usage',
      'usage.balance': 'Balance',
      'usage.cost': 'Cost (est.)',
      'usage.tokens': 'Tokens',
      'usage.team': 'Team',
      'usage.subagents': 'Subagents',
      'usage.empty': 'No usage recorded yet.',
      'usage.loading': 'Loading usage…',
      'usage.note': 'From Token & Balance and live session events.',
      'teammates.patched': 'Teammate routing: the patched spawn_teammate accepts provider/model/effort.',
      'teammates.unpatched': 'Teammate routing: stock spawn_teammate on this build; teammate rows guide delegate_model only.',
      'teammates.native': 'Teammate routing: teammates are subagents with native model selection.',
      'teammates.native-unselected': 'Teammate routing: subagents exist but model selection is off.',
      'teammates.unsupported': 'Teammate routing: no teammate or subagent tool is visible.',
      'common.loading': 'Loading…',
      'common.error': 'Could not read the delegation state.',
      'common.retry': 'Retry',
      'common.openPanel': 'Open session panel',
    }
    const zh = {
      'page.label': '委派模型',
      'page.title': '委派模型',
      'page.sub': 'Agent 团队与子代理的全局档案；会话可在右侧栏面板中覆盖。',
      'tab.profiles': '档案',
      'tab.rates': '费率',
      'tab.source': '自动配置',
      'profiles.add': '+ 添加档案',
      'profiles.save': '保存全局默认',
      'profiles.agentType': '代理类型',
      'profiles.taskType': '任务类型',
      'profiles.tier': '模型层级',
      'profiles.route': '路由',
      'profiles.effort': '强度',
      'profiles.default': '默认档案',
      'profiles.empty': '暂无档案。请添加或使用自动配置。',
      'profiles.saved': '已保存。',
      'rates.title': '费率卡',
      'rates.sub': '成本估算使用此卡；内置快照只是起点。',
      'rates.save': '保存费率',
      'rates.bundled': '使用内置快照',
      'rates.add': '+ 添加模型',
      'rates.custom': '自定义 JSON',
      'rates.applyJson': '应用 JSON',
      'rates.saved': '费率已保存。',
      'source.title': '从文件或粘贴自动配置',
      'source.sub': 'Agent 将规则映射到内置分类；来源会被记住，来源变化时重新应用。',
      'source.paste': '粘贴规则',
      'source.file': '选择文件',
      'source.save': '保存来源',
      'source.parse': '由 Agent 解析',
      'source.auto': '来源变化时重新应用',
      'source.saved': '来源已保存。',
      'source.parsePending': 'Agent 解析将在下一步实现。',
      'source.parsing': '解析中…',
      'source.apply': '应用档案',
      'source.proposals': '解析结果',
      'source.applied': '上次应用',
      'panel.title': '委派模型',
      'panel.inherit': '继承全局默认；此处更改仅对本会话生效。',
      'panel.override': '覆盖',
      'panel.useGlobal': '使用全局',
      'panel.apply': '应用到会话',
      'panel.reset': '恢复全局',
      'panel.empty': '暂无全局档案。请在 插件 → 委派模型 中添加。',
      'panel.note': 'V1.2 之前队友继承 Lead 模型；覆盖作用于 delegate_model 与子代理。',
      'usage.title': '会话用量',
      'usage.balance': '余额',
      'usage.cost': '成本（估算）',
      'usage.tokens': 'Token',
      'usage.team': '团队',
      'usage.subagents': '子代理',
      'usage.empty': '暂无用量记录。',
      'usage.loading': '加载用量…',
      'usage.note': '来自 Token & Balance 与实时会话事件。',
      'teammates.patched': '队友路由：补丁版 spawn_teammate 接受 provider/model/effort。',
      'teammates.unpatched': '队友路由：当前构建为原版 spawn_teammate；队友行仅作用于 delegate_model。',
      'teammates.native': '队友路由：队友是具备原生模型选择的子代理。',
      'teammates.native-unselected': '队友路由：子代理可用，但模型选择未启用。',
      'teammates.unsupported': '队友路由：当前构建没有可见的队友或子代理工具。',
      'common.loading': '加载中…',
      'common.error': '无法读取委派状态。',
      'common.retry': '重试',
      'common.openPanel': '打开会话面板',
    }

    const S = {
      page: { padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0, overflow: 'auto' },
      head: { display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' },
      title: { margin: 0, fontSize: '19px', fontWeight: 600, color: 'var(--dsw-alias-label-primary, #e7eef7)' },
      sub: { margin: 0, fontSize: '12.5px', color: 'var(--dsw-alias-label-tertiary, #8ea3b8)' },
      actions: { marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' },
      tabs: { display: 'flex', gap: '2px', borderBottom: '1px solid var(--dsw-alias-border-l1, #1e3349)' },
      tab: { padding: '7px 11px', fontSize: '12.5px', cursor: 'pointer', color: 'var(--dsw-alias-label-tertiary, #8ea3b8)', borderBottom: '2px solid transparent', background: 'transparent', border: 'none' },
      tabActive: { color: 'var(--dsw-alias-label-primary, #e7eef7)', borderBottomColor: 'var(--dsw-alias-brand-primary, #3aa0ff)' },
      card: { border: '1px solid var(--dsw-alias-border-l1, #1e3349)', borderRadius: '10px', overflow: 'hidden', background: 'var(--dsw-alias-bg-layer-1, #111f2e)' },
      table: { width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' },
      th: { textAlign: 'left', padding: '8px 10px', fontSize: '10.5px', letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--dsw-alias-label-caption, #657a8f)', borderBottom: '1px solid var(--dsw-alias-border-l1, #1e3349)' },
      td: { padding: '7px 10px', borderBottom: '1px solid var(--dsw-alias-border-l1, #1e3349)', verticalAlign: 'middle' },
      input: { background: 'var(--dsw-alias-bg-layer-2, #132334)', color: 'var(--dsw-alias-label-primary, #e7eef7)', border: '1px solid var(--dsw-alias-border-l2, #25405a)', borderRadius: '7px', padding: '4px 7px', fontSize: '12px', minWidth: 0 },
      route: { minWidth: '210px' },
      button: { border: '1px solid var(--dsw-alias-border-l2, #25405a)', background: 'transparent', color: 'var(--dsw-alias-label-primary, #e7eef7)', borderRadius: '8px', padding: '5px 10px', fontSize: '12px', cursor: 'pointer' },
      primary: { borderColor: 'transparent', background: 'var(--dsw-alias-brand-primary, #3aa0ff)', color: '#04121f', fontWeight: 600 },
      danger: { color: 'var(--dsw-alias-label-error, #ff6464)' },
      note: { fontSize: '11.5px', color: 'var(--dsw-alias-label-tertiary, #8ea3b8)' },
      error: { fontSize: '12px', color: 'var(--dsw-alias-label-error, #ff6464)', whiteSpace: 'pre-wrap' },
      ok: { fontSize: '12px', color: 'var(--dsw-alias-label-success, #3fbf7f)' },
      rowFlex: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
      textarea: { width: '100%', minHeight: '160px', background: 'var(--dsw-alias-bg-layer-2, #132334)', color: 'var(--dsw-alias-label-primary, #e7eef7)', border: '1px solid var(--dsw-alias-border-l2, #25405a)', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
      code: { fontSize: '11px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', color: 'var(--dsw-alias-label-tertiary, #8ea3b8)' },
      section: { padding: '10px 12px', borderBottom: '1px solid var(--dsw-alias-border-l1, #1e3349)' },
      grow: { flex: 1 },
      panel: { padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', height: '100%', overflow: 'auto' },
      panelRow: { display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', padding: '7px 0', borderBottom: '1px solid var(--dsw-alias-border-l1, #1e3349)' },
      small: { fontSize: '11px', color: 'var(--dsw-alias-label-caption, #657a8f)' },
    }

    async function request(path, options) {
      const response = await fetch(`/dsh-delegation-models${path}`, {
        headers: { accept: 'application/json', ...options?.body === undefined ? {} : { 'content-type': 'application/json' } },
        ...options,
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        const errors = data !== null && Array.isArray(data.errors) ? data.errors : [response.statusText]
        throw new Error(errors.join('\n'))
      }
      return data
    }

    function useDelegationState(sessionId) {
      const [state, setState] = React.useState({ status: 'loading', data: null, error: null })
      const load = React.useCallback(async () => {
        try {
          const query = sessionId === undefined || sessionId === null ? '' : `?sessionId=${encodeURIComponent(String(sessionId))}`
          setState({ status: 'ready', data: await request(`/state${query}`), error: null })
        } catch (error) {
          setState({ status: 'error', data: null, error: error instanceof Error ? error.message : String(error) })
        }
      }, [sessionId])
      React.useEffect(() => {
        let alive = true
        load()
        return () => { alive = false }
      }, [load])
      return [state, load]
    }

    function Select(props) {
      return h('select', {
        value: props.value ?? '',
        onChange: (event) => props.onChange(event.target.value),
        style: { ...S.input, ...props.style },
        'aria-label': props.label,
      }, (props.options ?? []).map((option) => h('option', { key: option.value, value: option.value }, option.label)))
    }

    function trimTokens(value) {
      if (!Number.isFinite(value) || value <= 0) return '0'
      if (value >= 1e9) return `${(value / 1e9).toFixed(1).replace(/\.0$/, '')}B`
      if (value >= 1e6) return `${(value / 1e6).toFixed(1).replace(/\.0$/, '')}M`
      if (value >= 1e3) return `${(value / 1e3).toFixed(1).replace(/\.0$/, '')}k`
      return String(Math.round(value))
    }

    function symbolOf(currency) {
      if (currency === 'CNY') return '¥'
      if (currency === 'USD') return '$'
      return ''
    }

    function money(value, currency) {
      if (value === null || value === undefined) return '—'
      return `${symbolOf(currency)}${Number(value).toFixed(2)}`
    }

    function useUsage(sessionId) {
      const [state, setState] = React.useState({ status: 'loading', data: null, error: null })
      const load = React.useCallback(async () => {
        if (sessionId === undefined || sessionId === null) return
        try {
          const data = await request(`/usage?sessionId=${encodeURIComponent(String(sessionId))}`)
          setState({ status: 'ready', data, error: null })
        } catch (error) {
          setState({ status: 'error', data: null, error: error instanceof Error ? error.message : String(error) })
        }
      }, [sessionId])
      React.useEffect(() => {
        let alive = true
        const run = async () => { if (alive) await load() }
        run()
        const timer = setInterval(run, 20_000)
        return () => { alive = false; clearInterval(timer) }
      }, [load])
      return state
    }

    function UsageSection(props) {
      const t = props.t
      const state = useUsage(props.sessionId)
      if (state.status === 'loading') return h('div', { style: S.note }, t('usage.loading'))
      if (state.status === 'error') return h('div', { style: S.error }, state.error ?? '')
      const data = state.data
      if (data === null) return null
      const currency = data.currency ?? data.balance?.currency ?? null
      const team = data.team ?? []
      const subagents = data.subagents ?? []
      const table = (rows) => rows.length === 0
        ? h('div', { style: S.note }, t('usage.empty'))
        : h('table', { style: S.table },
            h('thead', null, h('tr', null,
              h('th', { style: S.th }, 'Agent'),
              h('th', { style: S.th }, 'Model'),
              h('th', { style: S.th }, t('usage.tokens')),
              h('th', { style: S.th }, t('usage.cost')),
            )),
            h('tbody', null, rows.map((row) => h('tr', { key: row.id },
              h('td', { style: S.td }, row.name),
              h('td', { style: S.td }, row.model === null ? '—' : `${row.provider}/${row.model}`),
              h('td', { style: S.td }, trimTokens(row.usage?.totalTokens ?? 0)),
              h('td', { style: S.td }, money(row.cost, currency)),
            ))),
          )
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
        h('div', { style: { fontWeight: 600, fontSize: '12.5px' } }, t('usage.title')),
        h('div', { style: S.note },
          `${t('usage.balance')} ${data.balance === null ? '—' : money(data.balance.total, currency)}`,
          ` · ${t('usage.cost')} ${money(data.totals?.cost, currency)}`,
          ` · ${t('usage.tokens')} ${trimTokens(data.totals?.usage?.totalTokens ?? 0)}`,
        ),
        h('div', { style: S.small }, t('usage.team')),
        table(team),
        h('div', { style: S.small }, t('usage.subagents')),
        table(subagents),
        h('div', { style: S.note }, t('usage.note')),
      )
    }

    function Field(props) {
      return h('label', { style: { display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px' } },
        h('span', { style: S.small }, props.label),
        props.children,
      )
    }

    function Status(props) {
      if (props.state.status === 'loading') return h('div', { style: S.note }, props.t('common.loading'))
      if (props.state.status === 'error') {
        return h('div', { style: S.rowFlex },
          h('span', { style: S.error }, `${props.t('common.error')} ${props.state.error ?? ''}`),
          h('button', { style: S.button, onClick: props.reload }, props.t('common.retry')),
        )
      }
      return null
    }

    function ProfilesTab(props) {
      const { data, t, reload } = props
      const [rows, setRows] = React.useState([])
      const [defaultProfile, setDefaultProfile] = React.useState('')
      const [message, setMessage] = React.useState(null)
      const [error, setError] = React.useState(null)

      React.useEffect(() => {
        const next = Object.entries(data.state.profiles ?? {}).map(([key, row]) => ({ key, ...row }))
        setRows(next)
        setDefaultProfile(data.state.defaultProfile ?? '')
      }, [data])

      const available = data.availableModels ?? []
      const agentTypes = data.catalog.agentTypes
      const taskTypes = data.catalog.taskTypes
      const tiers = data.catalog.tiers

      function update(index, patch) {
        setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row))
      }

      function addRow() {
        const used = new Set(rows.map((row) => `${row.agentType}::${row.taskType}`))
        let agentType = agentTypes[0].id
        let taskType = taskTypes[0].id
        outer: for (const agent of agentTypes) {
          for (const task of taskTypes) {
            if (!used.has(`${agent.id}::${task.id}`)) { agentType = agent.id; taskType = task.id; break outer }
          }
        }
        const route = available[0] ?? { provider: '', model: '' }
        setRows((current) => [...current, {
          agentType,
          taskType,
          tier: tiers[1]?.id ?? tiers[0].id,
          provider: route.provider,
          model: route.model,
          reasoningEffort: '',
        }])
      }

      async function save() {
        setMessage(null)
        setError(null)
        const profiles = {}
        for (const row of rows) {
          profiles[`${row.agentType}::${row.taskType}`] = {
            tier: row.tier,
            provider: row.provider,
            model: row.model,
            ...row.reasoningEffort === '' || row.reasoningEffort === undefined ? {} : { reasoningEffort: row.reasoningEffort },
          }
        }
        try {
          await request('/profiles', {
            method: 'POST',
            body: JSON.stringify({ profiles, defaultProfile: defaultProfile === '' ? undefined : defaultProfile }),
          })
          setMessage(t('profiles.saved'))
          await reload()
        } catch (saveError) {
          setError(saveError instanceof Error ? saveError.message : String(saveError))
        }
      }

      const options = (list) => list.map((entry) => ({ value: entry.id, label: entry.title }))
      const routeOptions = available.map((route) => ({ value: `${route.provider}\u0000${route.model}`, label: `${route.provider}/${route.model}` }))
      const splitRoute = (value) => {
        const index = value.indexOf('\u0000')
        return index < 0 ? { provider: value, model: '' } : { provider: value.slice(0, index), model: value.slice(index + 1) }
      }

      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
        rows.length === 0 ? h('div', { style: S.note }, t('profiles.empty')) : null,
        h('div', { style: S.card },
          h('table', { style: S.table },
            h('thead', null, h('tr', null,
              h('th', { style: S.th }, t('profiles.agentType')),
              h('th', { style: S.th }, t('profiles.taskType')),
              h('th', { style: S.th }, t('profiles.tier')),
              h('th', { style: S.th }, t('profiles.route')),
              h('th', { style: S.th }, t('profiles.effort')),
              h('th', { style: S.th }, ''),
            )),
            h('tbody', null, rows.map((row, index) => h('tr', { key: `${row.agentType}-${row.taskType}-${index}` },
              h('td', { style: S.td }, h(Select, { value: row.agentType, options: options(agentTypes), label: t('profiles.agentType'), onChange: (value) => update(index, { agentType: value }) })),
              h('td', { style: S.td }, h(Select, { value: row.taskType, options: options(taskTypes), label: t('profiles.taskType'), onChange: (value) => update(index, { taskType: value }) })),
              h('td', { style: S.td }, h(Select, { value: row.tier, options: options(tiers), label: t('profiles.tier'), onChange: (value) => update(index, { tier: value }) })),
              h('td', { style: S.td }, available.length === 0
                ? h('span', { style: S.note }, '—')
                : h(Select, {
                    value: `${row.provider}\u0000${row.model}`,
                    options: routeOptions,
                    label: t('profiles.route'),
                    style: S.route,
                    onChange: (value) => update(index, splitRoute(value)),
                  })),
              h('td', { style: S.td }, h('input', {
                style: { ...S.input, width: '80px' },
                value: row.reasoningEffort ?? '',
                placeholder: 'low',
                onChange: (event) => update(index, { reasoningEffort: event.target.value }),
              })),
              h('td', { style: S.td }, h('button', { style: S.button, onClick: () => setRows((current) => current.filter((_row, rowIndex) => rowIndex !== index)) }, '×')),
            ))),
          ),
        ),
        h('div', { style: S.rowFlex },
          h('button', { style: S.button, onClick: addRow }, t('profiles.add')),
          h(Field, { label: t('profiles.default') },
            h('select', {
              style: S.input,
              value: defaultProfile,
              onChange: (event) => setDefaultProfile(event.target.value),
            }, [h('option', { key: '', value: '' }, '—')].concat(rows.map((row) => h('option', { key: `${row.agentType}::${row.taskType}`, value: `${row.agentType}::${row.taskType}` }, `${row.agentType} · ${row.taskType}`)))),
          ),
          h('span', { style: S.grow }),
          error === null ? null : h('span', { style: S.error }, error),
          message === null ? null : h('span', { style: S.ok }, message),
          h('button', { style: { ...S.button, ...S.primary }, onClick: save }, t('profiles.save')),
        ),
        h('div', { style: S.note }, 'Rows address Agent type × Task type. The default row is used when a delegation names neither.'),
        data.teammates === undefined ? null : h('div', { style: S.note }, t(`teammates.${data.teammates.mode}`)),
      )
    }

    function RatesTab(props) {
      const { data, t, reload } = props
      const [card, setCard] = React.useState(data.state.rates)
      const [text, setText] = React.useState(() => JSON.stringify(data.state.rates, null, 2))
      const [message, setMessage] = React.useState(null)
      const [error, setError] = React.useState(null)

      React.useEffect(() => {
        setCard(data.state.rates)
        setText(JSON.stringify(data.state.rates, null, 2))
      }, [data])

      function update(index, patch) {
        setCard((current) => ({
          ...current,
          models: current.models.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row),
        }))
      }

      function addRow() {
        setCard((current) => ({
          ...current,
          models: [...current.models, { provider: '', model: '', input: 0, cacheRead: 0, cacheWrite: 0, output: 0 }],
        }))
      }

      function useBundled() {
        setCard(data.bundledRates)
        setText(JSON.stringify(data.bundledRates, null, 2))
      }

      function applyJson() {
        setError(null)
        try {
          setCard(JSON.parse(text))
        } catch (parseError) {
          setError(parseError instanceof Error ? parseError.message : String(parseError))
        }
      }

      async function save() {
        setMessage(null)
        setError(null)
        try {
          await request('/rates', { method: 'POST', body: JSON.stringify({ rates: card }) })
          setMessage(t('rates.saved'))
          await reload()
        } catch (saveError) {
          setError(saveError instanceof Error ? saveError.message : String(saveError))
        }
      }

      const number = (value, onChange) => h('input', {
        type: 'number',
        step: '0.001',
        min: '0',
        style: { ...S.input, width: '84px' },
        value: String(value ?? 0),
        onChange: (event) => onChange(Number(event.target.value)),
      })

      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
        h('div', null,
          h('div', { style: { fontWeight: 600 } }, t('rates.title')),
          h('div', { style: S.note }, t('rates.sub')),
        ),
        h('div', { style: S.card },
          h('table', { style: S.table },
            h('thead', null, h('tr', null,
              h('th', { style: S.th }, 'Provider'),
              h('th', { style: S.th }, 'Model'),
              h('th', { style: S.th }, 'Input'),
              h('th', { style: S.th }, 'Cache read'),
              h('th', { style: S.th }, 'Cache write'),
              h('th', { style: S.th }, 'Output'),
              h('th', { style: S.th }, ''),
            )),
            h('tbody', null, (card.models ?? []).map((row, index) => h('tr', { key: index },
              h('td', { style: S.td }, h('input', { style: { ...S.input, width: '150px' }, value: row.provider, onChange: (event) => update(index, { provider: event.target.value }) })),
              h('td', { style: S.td }, h('input', { style: { ...S.input, width: '170px' }, value: row.model, onChange: (event) => update(index, { model: event.target.value }) })),
              h('td', { style: S.td }, number(row.input, (value) => update(index, { input: value }))),
              h('td', { style: S.td }, number(row.cacheRead, (value) => update(index, { cacheRead: value }))),
              h('td', { style: S.td }, number(row.cacheWrite, (value) => update(index, { cacheWrite: value }))),
              h('td', { style: S.td }, number(row.output, (value) => update(index, { output: value }))),
              h('td', { style: S.td }, h('button', { style: S.button, onClick: () => setCard((current) => ({ ...current, models: current.models.filter((_row, rowIndex) => rowIndex !== index) })) }, '×')),
            ))),
          ),
        ),
        h('div', { style: S.rowFlex },
          h('button', { style: S.button, onClick: addRow }, t('rates.add')),
          h('button', { style: S.button, onClick: useBundled }, t('rates.bundled')),
          h('span', { style: S.grow }),
          error === null ? null : h('span', { style: S.error }, error),
          message === null ? null : h('span', { style: S.ok }, message),
          h('button', { style: { ...S.button, ...S.primary }, onClick: save }, t('rates.save')),
        ),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
          h('div', { style: S.note }, t('rates.custom')),
          h('textarea', { style: S.textarea, value: text, onChange: (event) => setText(event.target.value) }),
          h('div', null, h('button', { style: S.button, onClick: applyJson }, t('rates.applyJson'))),
        ),
      )
    }

    function SourceTab(props) {
      const { data, t, reload } = props
      const [text, setText] = React.useState(data.state.source?.text ?? '')
      const [autoApply, setAutoApply] = React.useState(data.state.source?.autoApply ?? true)
      const [filePath, setFilePath] = React.useState(data.state.source?.path ?? '')
      const [message, setMessage] = React.useState(null)
      const [error, setError] = React.useState(null)
      const [parsing, setParsing] = React.useState(false)
      const [proposals, setProposals] = React.useState(null)

      React.useEffect(() => {
        setText(data.state.source?.text ?? '')
        setAutoApply(data.state.source?.autoApply ?? true)
        setFilePath(data.state.source?.path ?? '')
      }, [data])

      async function save() {
        setMessage(null)
        setError(null)
        try {
          await request('/source', {
            method: 'POST',
            body: JSON.stringify({
              source: {
                kind: filePath === '' ? 'paste' : 'file',
                ...filePath === '' ? {} : { path: filePath },
                text,
                autoApply,
              },
            }),
          })
          setMessage(t('source.saved'))
          await reload()
        } catch (saveError) {
          setError(saveError instanceof Error ? saveError.message : String(saveError))
        }
      }

      async function pickFile(event) {
        const file = event.target.files?.[0]
        if (file === undefined) return
        setText(await file.text())
        setFilePath(typeof file.path === 'string' ? file.path : '')
      }

      async function parse() {
        setMessage(null)
        setError(null)
        setParsing(true)
        try {
          const result = await request('/parse', { method: 'POST', body: JSON.stringify({ text }) })
          setProposals(result.profiles)
          setMessage(`${t('source.proposals')}: ${Object.keys(result.profiles).length}`)
        } catch (parseError) {
          setError(parseError instanceof Error ? parseError.message : String(parseError))
        } finally {
          setParsing(false)
        }
      }

      async function applyProposals() {
        setMessage(null)
        setError(null)
        try {
          const keys = Object.keys(proposals ?? {})
          await request('/profiles', {
            method: 'POST',
            body: JSON.stringify({ profiles: proposals, defaultProfile: data.state.defaultProfile ?? keys[0] }),
          })
          setMessage(t('profiles.saved'))
          setProposals(null)
          await reload()
        } catch (applyError) {
          setError(applyError instanceof Error ? applyError.message : String(applyError))
        }
      }

      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
        h('div', null,
          h('div', { style: { fontWeight: 600 } }, t('source.title')),
          h('div', { style: S.note }, t('source.sub')),
        ),
        filePath === '' ? null : h('div', { style: S.small }, filePath),
        data.state.source?.appliedAt === undefined ? null : h('div', { style: S.small }, `${t('source.applied')}: ${data.state.source.appliedAt}`),
        data.state.source?.lastError === undefined ? null : h('div', { style: S.error }, data.state.source.lastError),
        h('div', { style: S.rowFlex },
          h('label', { style: S.button }, t('source.file'), h('input', { type: 'file', accept: '.json,.xml,.txt,.md', style: { display: 'none' }, onChange: pickFile })),
          h('label', { style: { ...S.rowFlex, fontSize: '12px' } },
            h('input', { type: 'checkbox', checked: autoApply, onChange: (event) => setAutoApply(event.target.checked) }),
            t('source.auto'),
          ),
        ),
        h('textarea', { style: S.textarea, value: text, onChange: (event) => setText(event.target.value), placeholder: t('source.paste') }),
        h('div', { style: S.rowFlex },
          h('button', { style: { ...S.button, ...S.primary }, onClick: save }, t('source.save')),
          h('button', { style: S.button, disabled: parsing, onClick: parse }, parsing ? t('source.parsing') : t('source.parse')),
          h('span', { style: S.grow }),
          error === null ? null : h('span', { style: S.error }, error),
          message === null ? null : h('span', { style: S.ok }, message),
        ),
        proposals === null ? null : h('div', { style: S.card },
          h('div', { style: S.section }, h('b', null, t('source.proposals'))),
          h('table', { style: S.table },
            h('tbody', null, Object.entries(proposals).map(([key, row]) => h('tr', { key },
              h('td', { style: S.td }, key),
              h('td', { style: S.td }, `${row.provider}/${row.model}${row.reasoningEffort === undefined ? '' : ` @ ${row.reasoningEffort}`}`),
            ))),
          ),
          h('div', { style: { padding: '8px 12px' } },
            h('button', { style: { ...S.button, ...S.primary }, onClick: applyProposals }, `${t('source.apply')} (${Object.keys(proposals).length})`),
          ),
        ),
        h('div', { style: S.note }, t('source.sub')),
      )
    }

    function DelegationPage(props) {
      const t = props.t
      const [tab, setTab] = React.useState('profiles')
      const [state, reload] = useDelegationState(undefined)
      if (state.status !== 'ready') return h('div', { style: S.page }, h(Status, { state, reload, t }))
      const data = state.data
      const tabButton = (id, label) => h('button', {
        key: id,
        style: { ...S.tab, ...(tab === id ? S.tabActive : {}) },
        onClick: () => setTab(id),
      }, label)
      return h('div', { style: S.page },
        h('div', { style: S.head },
          h('div', null,
            h('h1', { style: S.title }, t('page.title')),
            h('p', { style: S.sub }, t('page.sub')),
          ),
          h('div', { style: S.actions },
            h('button', { style: S.button, onClick: props.openPanel }, t('common.openPanel')),
          ),
        ),
        h('div', { style: S.tabs },
          tabButton('profiles', t('tab.profiles')),
          tabButton('rates', t('tab.rates')),
          tabButton('source', t('tab.source')),
        ),
        tab === 'profiles' ? h(ProfilesTab, { data, t, reload }) : null,
        tab === 'rates' ? h(RatesTab, { data, t, reload }) : null,
        tab === 'source' ? h(SourceTab, { data, t, reload }) : null,
      )
    }

    function SessionPanel(props) {
      const t = props.t
      const sessionId = props.sessionId
      const [state, reload] = useDelegationState(sessionId)
      const [rows, setRows] = React.useState({})
      const [message, setMessage] = React.useState(null)
      const [error, setError] = React.useState(null)
      const profiles = state.status === 'ready' ? state.data.state.profiles ?? {} : {}

      React.useEffect(() => {
        if (state.status !== 'ready') return
        setRows(state.data.overrides?.rows ?? {})
      }, [state])

      if (state.status !== 'ready') return h('div', { style: S.panel }, h(Status, { state, reload, t }))
      const data = state.data
      const available = data.availableModels ?? []
      const keys = Object.keys(profiles)

      function toggle(key) {
        setRows((current) => {
          const next = { ...current }
          if (next[key] === undefined) next[key] = {}
          else delete next[key]
          return next
        })
      }

      function update(key, patch) {
        setRows((current) => ({ ...current, [key]: { ...(current[key] ?? {}), ...patch } }))
      }

      async function apply() {
        setMessage(null)
        setError(null)
        if (sessionId === undefined) return
        try {
          await request('/overrides', { method: 'POST', body: JSON.stringify({ sessionId: String(sessionId), rows }) })
          setMessage(t('panel.apply'))
          await reload()
        } catch (applyError) {
          setError(applyError instanceof Error ? applyError.message : String(applyError))
        }
      }

      async function reset() {
        setMessage(null)
        setError(null)
        if (sessionId === undefined) return
        try {
          await request('/overrides', { method: 'POST', body: JSON.stringify({ sessionId: String(sessionId), rows: {} }) })
          setRows({})
          await reload()
        } catch (resetError) {
          setError(resetError instanceof Error ? resetError.message : String(resetError))
        }
      }

      const routeSelect = (key, override) => h('select', {
        style: { ...S.input, width: '100%' },
        value: override.provider === undefined ? '' : `${override.provider}\u0000${override.model ?? ''}`,
        onChange: (event) => {
          const value = event.target.value
          if (value === '') { update(key, { provider: undefined, model: undefined }); return }
          const index = value.indexOf('\u0000')
          update(key, { provider: value.slice(0, index), model: value.slice(index + 1) })
        },
      }, [h('option', { key: '', value: '' }, t('panel.useGlobal'))].concat(available.map((route) => h('option', {
        key: `${route.provider}/${route.model}`,
        value: `${route.provider}\u0000${route.model}`,
      }, `${route.provider}/${route.model}`))))

      if (keys.length === 0) {
        return h('div', { style: S.panel },
          h('div', { style: { fontWeight: 600, fontSize: '13px' } }, t('panel.title')),
          h('div', { style: S.note }, t('panel.empty')),
        )
      }

      return h('div', { style: S.panel },
        h('div', null,
          h('div', { style: { fontWeight: 600, fontSize: '13px' } }, t('panel.title')),
          h('div', { style: S.note }, t('panel.inherit')),
        ),
        keys.map((key) => {
          const row = profiles[key]
          const override = rows[key]
          const overridden = override !== undefined
          const inherited = `${row.provider}/${row.model}${row.reasoningEffort === undefined ? '' : ` @ ${row.reasoningEffort}`}`
          return h('div', { key, style: S.panelRow },
            h('div', null,
              h('div', { style: { fontSize: '12px' } }, key),
              h('div', { style: S.small }, inherited),
              overridden ? h('div', { style: { marginTop: '5px' } }, routeSelect(key, override)) : null,
            ),
            h('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
              h('button', { style: S.button, onClick: () => toggle(key) }, overridden ? t('panel.useGlobal') : t('panel.override')),
            ),
          )
        }),
        h('div', { style: S.note }, t('panel.note')),
        data.teammates === undefined ? null : h('div', { style: S.note }, t(`teammates.${data.teammates.mode}`)),
        h(UsageSection, { sessionId, t }),
        error === null ? null : h('div', { style: S.error }, error),
        message === null ? null : h('div', { style: S.ok }, message),
        h('div', { style: S.rowFlex },
          h('button', { style: S.button, onClick: reset }, t('panel.reset')),
          h('span', { style: S.grow }),
          h('button', { style: { ...S.button, ...S.primary }, onClick: apply }, t('panel.apply')),
        ),
      )
    }

    return {
      inject: ['slots', 'locale', 'sidebarRightTabs', 'sidebarRight'],
      apply(ctx) {
        let t = (key) => key
        try {
          if (ctx.locale !== undefined && typeof ctx.locale.register === 'function') {
            ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'delegation-models: locale')
            t = ctx.locale.bind(NS)
          }
        } catch {
          // Locale is optional; fall back to the key itself.
        }
        const openPanel = () => {
          try {
            ctx.sidebarRight.openTab(PANEL_KIND)
          } catch {
            // No Session mounted; the page button is a no-op then.
          }
        }
        ctx.effect(
          () => ctx.slots.inject('plugins.tab', () => ctx.slots.register(
            { name: 'plugins.tab', id: PAGE_ID, order: 20, label: () => t('page.label') },
            (props) => h(DelegationPage, { ...props, t, openPanel }),
          )),
          'delegation-models: settings page',
        )
        ctx.effect(
          () => ctx.sidebarRightTabs.register({ id: PANEL_ID, kind: PANEL_KIND, title: () => t('panel.title') }),
          'delegation-models: session panel type',
        )
        ctx.effect(
          () => ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register(
            { name: 'sidebar.right.pane.tab', key: PANEL_ID, locale: NS },
            (props) => h(SessionPanel, { ...props, t: props.t !== undefined ? props.t : t }),
          )),
          'delegation-models: session panel body',
        )
      },
    }
  },
})
