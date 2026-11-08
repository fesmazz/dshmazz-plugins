window.__ModuleLoader__.load({
  id: '@fesmazz/dsh-token-balance',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'dsh-token-balance'
    const TYPE_ID = '@fesmazz/dsh-token-balance/usage'
    const KIND = 'token-balance-usage'
    const POLL_MS = 30000
    const STALE_MS = 15000

    const en = {
      'dock.aria': 'Open the usage panel',
      'dock.balance': 'Balance',
      'dock.window': '{hours}h',
      'dock.tokens': 'tokens',
      'dock.loading': '…',
      'dock.unavailable': 'Usage unavailable',
      'dock.noKey': 'Sign in or set an API key',
      'dock.balanceError': 'Balance unavailable',
      'dock.balanceUnavailable': '—',
      'dock.noUsage': 'No usage',
      'preview.title': 'Usage',
      'preview.range': 'Last 24 hours',
      'preview.cost': 'Est. cost',
      'preview.tokens': 'Tokens',
      'preview.thisSession': 'This session',
      'preview.allSessions': 'All sessions',
      'preview.share': 'This session is {percent}% of the {hours}-hour cost.',
      'preview.open': 'Open usage panel',
      'preview.empty': 'No usage in the last {hours}h.',
      'range.label': 'Time range',
      'panel.title': 'Usage',
      'guide.title': 'Usage & balance',
      'guide.description': 'Balance, cost and tokens for this session',
      'panel.range': 'Last 24 hours',
      'panel.costTab': 'Cost',
      'panel.tokensTab': 'Tokens',
      'panel.balance': 'Balance',
      'panel.topUp': 'Top up',
      'panel.costByHour': 'Cost by hour',
      'panel.tokensByHour': 'Tokens by hour',
      'panel.costPer30m': 'Cost per 30 minutes',
      'panel.tokensPer30m': 'Tokens per 30 minutes',
      'panel.costPer2h': 'Cost per 2 hours',
      'panel.axis': 'Y axis',
      'panel.axisAuto': 'Auto',
      'panel.breakdown': 'Consumption',
      'panel.byProject': 'By project',
      'panel.bySession': 'By session',
      'panel.byKind': 'By session kind',
      'panel.kind': 'Kind',
      'kind.chat': 'Chat',
      'kind.team': 'Team member',
      'kind.sub-agent': 'Sub-agent',
      'kind.undefined': 'Undefined',
      'panel.project': 'Project',
      'panel.session': 'Session',
      'panel.other': 'Other',
      'panel.cost': 'Cost',
      'panel.tokens': 'Tokens',
      'panel.tokensPer2h': 'Tokens per 2 hours',
      'panel.hint': 'Hover a bar for details',
      'panel.foot': 'Estimated from local sessions · DeepSeek list prices',
      'panel.updated': 'Updated {when}',
      'panel.loading': 'Loading usage…',
      'panel.empty': 'No usage in the selected window.',
      'panel.error': 'Usage data unavailable',
      'panel.retry': 'Retry',
      'stat.cost': 'Est. cost',
      'stat.requests': 'API requests',
      'stat.tokens': 'Tokens',
      'stat.totalTokens': 'Total tokens',
      'stat.prompt': 'Prompt tokens',
      'stat.completion': 'Completion tokens',
      'tooltip.requests': '{count} requests',
      'tooltip.total': 'Total',
      'chart.now': 'Now',
      'time.justNow': 'just now',
      'time.seconds': '{count}s ago',
      'time.minutes': '{count}m ago',
      'time.hours': '{count}h ago',
    }
    const zh = {
      'dock.aria': '打开用量面板',
      'dock.balance': '余额',
      'dock.window': '{hours}小时',
      'dock.tokens': 'Token',
      'dock.loading': '…',
      'dock.unavailable': '用量不可用',
      'dock.noKey': '请登录或配置 API Key',
      'dock.balanceError': '余额不可用',
      'dock.balanceUnavailable': '—',
      'dock.noUsage': '无用量',
      'preview.title': '用量',
      'preview.range': '最近 24 小时',
      'preview.cost': '预估费用',
      'preview.tokens': 'Token',
      'preview.thisSession': '本次会话',
      'preview.allSessions': '全部会话',
      'preview.share': '本次会话占 {hours} 小时费用的 {percent}%。',
      'preview.open': '打开用量面板',
      'preview.empty': '最近 {hours} 小时内无用量。',
      'range.label': '时间范围',
      'panel.title': '用量',
      'guide.title': '用量与余额',
      'guide.description': '本会话的余额、费用与 Token',
      'panel.range': '最近 24 小时',
      'panel.costTab': '费用',
      'panel.tokensTab': 'Token',
      'panel.balance': '余额',
      'panel.topUp': '充值',
      'panel.costByHour': '每小时费用',
      'panel.tokensByHour': '每小时 Token',
      'panel.costPer30m': '每 30 分钟费用',
      'panel.tokensPer30m': '每 30 分钟 Token',
      'panel.costPer2h': '每 2 小时费用',
      'panel.axis': 'Y 轴',
      'panel.axisAuto': '自动',
      'panel.breakdown': '消费构成',
      'panel.byProject': '按项目',
      'panel.bySession': '按会话',
      'panel.byKind': '按会话类型',
      'panel.kind': '类型',
      'kind.chat': '对话',
      'kind.team': '团队成员',
      'kind.sub-agent': '子代理',
      'kind.undefined': '未定义',
      'panel.project': '项目',
      'panel.session': '会话',
      'panel.other': '其他',
      'panel.cost': '费用',
      'panel.tokens': 'Token',
      'panel.tokensPer2h': '每 2 小时 Token',
      'panel.hint': '悬停柱状图查看明细',
      'panel.foot': '根据本地会话与 DeepSeek 目录价估算',
      'panel.updated': '更新于 {when}',
      'panel.loading': '正在加载用量…',
      'panel.empty': '所选时间范围内无用量。',
      'panel.error': '用量数据不可用',
      'panel.retry': '重试',
      'stat.cost': '预估费用',
      'stat.requests': 'API 请求',
      'stat.tokens': 'Token',
      'stat.totalTokens': 'Token 总量',
      'stat.prompt': '输入 Token',
      'stat.completion': '输出 Token',
      'tooltip.requests': '{count} 次请求',
      'tooltip.total': '合计',
      'chart.now': '现在',
      'time.justNow': '刚刚',
      'time.seconds': '{count} 秒前',
      'time.minutes': '{count} 分钟前',
      'time.hours': '{count} 小时前',
    }

    const C = {
      primary: 'var(--dsw-alias-label-primary)',
      secondary: 'var(--dsw-alias-label-secondary)',
      tertiary: 'var(--dsw-alias-label-tertiary)',
      caption: 'var(--dsw-alias-label-caption)',
      border1: 'var(--dsw-alias-border-l1)',
      border2: 'var(--dsw-alias-border-l2)',
      hover: 'var(--dsw-alias-interactive-bg-hover)',
      menu: 'var(--dsw-specific-menu)',
      shadow: 'var(--dsw-elevation-prominent)',
      radiusLg: 'var(--dsw-radius-lg)',
      radiusMd: 'var(--dsw-radius-md)',
      font: 'var(--dsw-font-family)',
      blue: 'var(--dsw-static-deepseek-450)',
      amber: 'var(--dsw-static-amber-500)',
      green: 'var(--dsw-static-green-500)',
      red: 'var(--dsw-static-red-400)',
      neutral: 'var(--dsw-static-neutral-bluish-500)',
    }
    const MODEL_COLORS = {
      'deepseek-v4-pro': C.blue,
      'deepseek-flash': C.amber,
    }
    const FALLBACK_COLORS = [C.green, C.red, C.neutral, C.blue, C.amber]

    function colorOf(modelId, index) {
      return MODEL_COLORS[modelId] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]
    }

    function numberOrZero(value) {
      return typeof value === 'number' && Number.isFinite(value) ? value : 0
    }
    function symbolOf(currency) {
      if (currency === 'CNY') return '¥'
      if (currency === 'USD') return '$'
      return ''
    }
    function trimZeros(text) {
      return text.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1')
    }
    function formatCost(value, currency) {
      const n = Number(value)
      if (!Number.isFinite(n)) return '—'
      if (n === 0) return symbolOf(currency) + '0'
      const abs = Math.abs(n)
      const digits = abs >= 0.1 ? 2 : abs >= 0.01 ? 3 : 4
      return symbolOf(currency) + n.toFixed(digits)
    }
    function formatTokens(value) {
      const n = Number(value)
      if (!Number.isFinite(n)) return '—'
      if (n >= 1e9) return trimZeros((n / 1e9).toFixed(2)) + 'B'
      if (n >= 1e6) return trimZeros((n / 1e6).toFixed(2)) + 'M'
      if (n >= 1e3) return trimZeros((n / 1e3).toFixed(1)) + 'k'
      return String(Math.round(n))
    }
    function formatCostPrecise(value, currency) {
      const n = Number(value)
      if (!Number.isFinite(n)) return '—'
      if (n === 0) return symbolOf(currency) + '0'
      return symbolOf(currency) + (Math.abs(n) >= 1 ? n.toFixed(2) : n.toFixed(3))
    }
    function formatInt(value) {
      const n = Number(value)
      return Number.isFinite(n) ? Math.round(n).toLocaleString() : '—'
    }
    function clockOf(ms) {
      const date = new Date(ms)
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return hours + ':' + minutes
    }
    function rangeOf(bucket) {
      return clockOf(bucket.start) + '–' + clockOf(bucket.end)
    }
    function timeAgo(ms, t) {
      const seconds = Math.max(0, Math.floor((Date.now() - numberOrZero(ms)) / 1000))
      if (seconds < 10) return t('time.justNow')
      if (seconds < 60) return t('time.seconds', { count: seconds })
      if (seconds < 3600) return t('time.minutes', { count: Math.floor(seconds / 60) })
      return t('time.hours', { count: Math.floor(seconds / 3600) })
    }
    function niceMax(value) {
      if (!Number.isFinite(value) || value <= 0) return 1
      const exponent = Math.floor(Math.log10(value))
      const power = Math.pow(10, exponent)
      const fraction = value / power
      const steps = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]
      const step = steps.find((candidate) => fraction <= candidate) || 10
      return step * power
    }
    function balanceTextOf(balance, t) {
      if (balance === null || balance === undefined) return undefined
      if (balance.configured === false) return t('dock.noKey')
      if (typeof balance.error === 'string' && balance.error.length > 0) return t('dock.balanceError')
      if (balance.total === null || balance.total === undefined || balance.total === '') return t('dock.balanceUnavailable')
      const numeric = Number(balance.total)
      return symbolOf(balance.currency) + (Number.isFinite(numeric) ? numeric.toFixed(2) : String(balance.total))
    }
    function modelValue(bucket, modelId, metric) {
      const entry = bucket.models[modelId]
      if (entry === undefined) return 0
      return metric === 'cost' ? numberOrZero(entry.cost) : numberOrZero(entry.totalTokens)
    }
    function bucketValue(bucket, models, metric) {
      let sum = 0
      for (const model of models) sum += modelValue(bucket, model.id, metric)
      return sum
    }

    function createStore() {
      const allowedHours = [6, 12, 24, 48]
      let state = { status: 'loading', data: null, error: null, at: 0, hours: 24, sessionId: undefined, key: '24|' }
      const listeners = new Set()
      let timer = null
      let requestSeq = 0
      const emit = () => {
        for (const listener of [...listeners]) listener()
      }
      const keyOf = () => String(state.hours) + '|' + (state.sessionId === undefined ? '' : state.sessionId)
      const load = (force) => {
        const key = keyOf()
        if (!force && state.data !== null && state.at !== 0 && state.key === key && Date.now() - state.at < 4000) {
          return Promise.resolve(state.data)
        }
        const mySeq = ++requestSeq
        const requestHours = state.hours
        const requestSession = state.sessionId
        state = { ...state, status: state.data === null ? 'loading' : 'refreshing' }
        emit()
        let url = '/dsh-token-balance?hours=' + String(requestHours)
        if (requestSession !== undefined) url += '&sessionId=' + encodeURIComponent(String(requestSession))
        return fetch(url, {
          headers: { accept: 'application/json' },
          cache: 'no-store',
          signal: typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(20000) : undefined,
        })
          .then((response) => {
            if (!response.ok) throw new Error('HTTP ' + String(response.status))
            return response.json()
          })
          .then((data) => {
            if (mySeq !== requestSeq || keyOf() !== key) return state.data
            state = { status: 'ready', data, error: null, at: Date.now(), hours: requestHours, sessionId: requestSession, key }
            emit()
            return data
          })
          .catch((error) => {
            if (mySeq !== requestSeq || keyOf() !== key) return state.data
            state = { ...state, status: state.data === null ? 'error' : 'stale', error: error instanceof Error ? error.message : String(error) }
            emit()
            return state.data
          })
      }
      const setHours = (hours) => {
        if (!allowedHours.includes(hours) || hours === state.hours) return
        state = { ...state, hours }
        emit()
        load(true)
      }
      const setSession = (sessionId) => {
        const next = typeof sessionId === 'string' && sessionId.length > 0 ? sessionId : undefined
        if (next === state.sessionId) return
        state = { ...state, sessionId: next }
        emit()
        load(true)
      }
      return {
        subscribe(listener) {
          listeners.add(listener)
          if (timer === null) {
            load(false)
            timer = setInterval(() => load(false), POLL_MS)
          }
          return () => {
            listeners.delete(listener)
            if (listeners.size === 0 && timer !== null) {
              clearInterval(timer)
              timer = null
            }
          }
        },
        getSnapshot() {
          return state
        },
        refresh() {
          return load(true)
        },
        refreshIfStale(maxAgeMs) {
          if (state.data === null || state.at === 0 || Date.now() - state.at > maxAgeMs) return load(false)
          return Promise.resolve(state.data)
        },
        setHours,
        setSession,
      }
    }

    const S = {
      dockWrap: { position: 'relative', display: 'inline-flex', alignItems: 'center' },
      dockButton: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        border: 0,
        borderRadius: '6px',
        background: 'transparent',
        color: C.tertiary,
        fontFamily: 'inherit',
        fontSize: '12px',
        lineHeight: '18px',
        letterSpacing: '-0.005em',
        fontVariantNumeric: 'tabular-nums',
        padding: '1px 6px',
        margin: '0 -6px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'background .12s ease, color .12s ease',
      },
      preview: {
        position: 'fixed',
        transform: 'translateX(-50%)',
        width: 'min(300px, calc(100vw - 16px))',
        boxSizing: 'border-box',
        padding: '12px',
        borderRadius: C.radiusLg,
        background: C.menu,
        backdropFilter: 'var(--dsw-menu-backdrop-filter)',
        WebkitBackdropFilter: 'var(--dsw-menu-backdrop-filter)',
        boxShadow: C.shadow,
        color: C.secondary,
        fontFamily: C.font,
        fontVariantNumeric: 'tabular-nums',
        zIndex: 30,
        cursor: 'pointer',
      },
      previewHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' },
      previewTitle: { color: C.primary, fontSize: '13px', fontWeight: 600 },
      caption: { color: C.caption, fontSize: '11px', lineHeight: '15px' },
      range: { display: 'flex', gap: '2px', padding: '2px', borderRadius: '7px', background: 'rgba(255,255,255,.06)' },
      rangeButton: { border: 0, background: 'transparent', fontFamily: 'inherit', fontSize: '10px', lineHeight: '14px', padding: '2px 6px', borderRadius: '5px', color: C.caption, cursor: 'pointer' },
      rangeButtonActive: { background: '#f1f3f5', color: '#151517', fontWeight: 600 },
      previewEmpty: { color: C.tertiary, fontSize: '12px', lineHeight: '18px', padding: '6px 0 2px' },
      previewTable: { marginTop: '6px' },
      previewThead: { display: 'grid', gridTemplateColumns: '1fr 84px 84px', gap: '6px', color: C.caption, fontSize: '9.5px', textAlign: 'right', paddingBottom: '4px', borderBottom: '0.5px solid ' + C.border1 },
      previewTheadLabel: { textAlign: 'left' },
      previewTrow: { display: 'grid', gridTemplateColumns: '1fr 84px 84px', gap: '6px', marginTop: '6px', alignItems: 'baseline' },
      previewTrowLabel: { color: C.secondary, fontSize: '11px' },
      previewTrowValue: { color: C.primary, fontSize: '12px', fontWeight: 600, textAlign: 'right' },
      previewNote: { color: C.caption, fontSize: '9.5px', marginTop: '9px', lineHeight: '14px' },
      previewFoot: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '8px', borderTop: '0.5px solid ' + C.border1, color: C.caption, fontSize: '11px' },
      previewArrow: { color: C.tertiary, fontSize: '13px' },

      panel: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxSizing: 'border-box',
        height: '100%',
        overflowY: 'auto',
        padding: '14px 16px 18px',
        color: C.primary,
        fontFamily: C.font,
        fontSize: '12px',
        lineHeight: '18px',
        fontVariantNumeric: 'tabular-nums',
      },
      balanceBanner: { display: 'flex', alignItems: 'baseline', gap: '8px', background: '#101d29', border: '1px solid #24445f', borderRadius: '10px', padding: '8px 12px', margin: '10px 0' },
      balanceBig: { fontSize: '34px', fontWeight: 800, letterSpacing: '-0.4px', color: '#7fd1ff', fontVariantNumeric: 'tabular-nums' },
      balanceBannerLabel: { fontSize: '11px', color: '#8ea3b8' },
      topUp: { marginLeft: 'auto', fontSize: '11px', color: '#8ea3b8', textDecoration: 'none', borderBottom: '1px dotted #4a6b85', paddingBottom: '1px' },
      panelHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' },
      balanceChip: { display: 'flex', alignItems: 'baseline', gap: '6px', color: C.caption, fontSize: '11px', whiteSpace: 'nowrap' },
      balanceValue: { color: C.primary, fontSize: '12px', fontWeight: 600 },
      tabs: { display: 'flex', gap: '2px', padding: '2px', borderRadius: '8px', background: C.hover, alignSelf: 'flex-start' },
      tab: { border: 0, borderRadius: '6px', padding: '4px 13px', background: 'transparent', color: C.tertiary, fontFamily: 'inherit', fontSize: '12px', lineHeight: '17px', fontWeight: 500, cursor: 'pointer', minWidth: '62px' },
      tabActive: { background: 'var(--dsw-alias-label-primary)', color: 'var(--dsw-alias-bg-base)', fontWeight: 600 },
      stats: { display: 'flex', flexWrap: 'wrap', gap: '0', padding: '10px 0 12px', borderTop: '0.5px solid ' + C.border1, borderBottom: '0.5px solid ' + C.border1 },
      stat: { flex: '1 1 90px', minWidth: '90px', padding: '0 12px', borderLeft: '0.5px solid ' + C.border1, boxSizing: 'border-box' },
      statFirst: { paddingLeft: 0, borderLeft: 0 },
      statValue: { color: C.primary, fontSize: '20px', fontWeight: 600, lineHeight: '26px', letterSpacing: '-0.02em' },
      statLabel: { color: C.caption, fontSize: '11px', lineHeight: '15px', marginTop: '2px' },
      chartHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' },
      chartTitle: { color: C.secondary, fontSize: '12px' },
      legend: { display: 'flex', flexWrap: 'wrap', gap: '10px', color: C.tertiary, fontSize: '11px' },
      legendItem: { display: 'inline-flex', alignItems: 'center', gap: '5px' },
      legendSwatch: { width: '7px', height: '7px', borderRadius: '2px', flex: 'none' },
      chartWrap: { position: 'relative', width: '100%' },
      tooltip: {
        position: 'absolute',
        width: '196px',
        boxSizing: 'border-box',
        padding: '9px 11px 10px',
        borderRadius: '10px',
        background: C.menu,
        boxShadow: C.shadow,
        color: C.secondary,
        fontSize: '11px',
        lineHeight: '17px',
        pointerEvents: 'none',
        zIndex: 5,
      },
      tooltipHead: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px', color: C.caption, marginBottom: '5px' },
      tooltipRange: { color: C.secondary, fontWeight: 600, fontSize: '11.5px' },
      tooltipRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' },
      tooltipLabel: { display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 },
      tooltipDot: { width: '6px', height: '6px', borderRadius: '2px', flex: 'none' },
      tooltipModel: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
      tooltipValue: { color: C.primary, fontWeight: 500, whiteSpace: 'nowrap' },
      tooltipSep: { height: '0.5px', background: C.border1, margin: '6px 0' },
      tooltipFoot: { color: C.caption, fontSize: '10.5px', marginTop: '2px' },
      emptyBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '26px 12px', color: C.tertiary, fontSize: '12px', textAlign: 'center' },
      retry: { border: '0.5px solid ' + C.border2, borderRadius: '7px', background: 'transparent', color: C.secondary, fontFamily: 'inherit', fontSize: '11px', padding: '4px 10px', cursor: 'pointer' },
      foot: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginTop: '8px', paddingTop: '10px', borderTop: '0.5px solid ' + C.border1, color: C.caption, fontSize: '10.5px', lineHeight: '14px' },
      loading: { padding: '22px 0', color: C.tertiary, fontSize: '12px', textAlign: 'center' },
    }

    function useUsage(store) {
      return React.useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
    }

    function RangePicker({ t, hours, onChange }) {
      const values = [6, 12, 24, 48]
      return h(
        'div',
        { style: S.range, role: 'group', 'aria-label': t('range.label') },
        values.map((value) =>
          h(
            'button',
            {
              key: value,
              type: 'button',
              style: value === hours ? { ...S.rangeButton, ...S.rangeButtonActive } : S.rangeButton,
              'aria-pressed': value === hours,
              onClick: (event) => {
                event.stopPropagation()
                onChange(value)
              },
              onKeyDown: (event) => {
                event.stopPropagation()
              },
            },
            String(value) + 'h',
          ),
        ),
      )
    }

    function HoverPreview({ t, state, onOpen, onClose, anchor, onRange }) {
      const data = state.data
      const win = data === null || data.window == null ? undefined : data.window
      const currency = data === null || data.rates == null ? 'USD' : data.rates.currency
      const totals = win === undefined ? null : win.totals
      const session = data === null ? null : data.session
      const pending = win !== undefined && win.hours !== state.hours
      const share = session !== null && totals !== null && totals.cost > 0 ? (session.cost / totals.cost) * 100 : null
      const empty = win !== undefined && win.totals.requests === 0
      const sessionValue = (read) => (session === null ? '—' : read(session))
      return h(
        'div',
        {
          style: { ...S.preview, left: anchor.left + 'px', bottom: anchor.bottom + 'px' },
          role: 'dialog',
          'aria-label': t('preview.title'),
          tabIndex: 0,
          onClick: onOpen,
          onKeyDown: (event) => {
            if (event.target !== event.currentTarget) return
            if (event.key === 'Escape') {
              event.preventDefault()
              onClose()
            } else if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onOpen()
            }
          },
        },
        h(
          'div',
          { style: S.previewHead },
          h('span', { style: S.previewTitle }, t('preview.title')),
          h(RangePicker, { t, hours: state.hours, onChange: onRange }),
        ),
        data === null
          ? h('div', { style: S.previewEmpty }, state.status === 'error' ? t('dock.unavailable') : t('dock.loading'))
          : win === undefined
            ? h('div', { style: S.previewEmpty }, t('dock.unavailable'))
            : empty
              ? h('div', { style: S.previewEmpty }, t('preview.empty', { hours: win.hours }))
              : h(
                  React.Fragment,
                  null,
                  h(
                    'div',
                    { style: Object.assign({}, S.previewTable, pending ? { opacity: 0.55 } : null) },
                    h(
                      'div',
                      { style: S.previewThead },
                      h('span', { style: S.previewTheadLabel }),
                      h('span', null, t('preview.thisSession')),
                      h('span', null, t('preview.allSessions')),
                    ),
                    h(
                      'div',
                      { style: S.previewTrow },
                      h('span', { style: S.previewTrowLabel }, t('stat.cost')),
                      h('span', { style: S.previewTrowValue }, sessionValue((entry) => formatCost(entry.cost, currency))),
                      h('span', { style: S.previewTrowValue }, formatCost(totals.cost, currency)),
                    ),
                    h(
                      'div',
                      { style: S.previewTrow },
                      h('span', { style: S.previewTrowLabel }, t('stat.tokens')),
                      h('span', { style: S.previewTrowValue }, sessionValue((entry) => formatTokens(entry.totalTokens))),
                      h('span', { style: S.previewTrowValue }, formatTokens(totals.totalTokens)),
                    ),
                    h(
                      'div',
                      { style: S.previewTrow },
                      h('span', { style: S.previewTrowLabel }, t('stat.requests')),
                      h('span', { style: S.previewTrowValue }, sessionValue((entry) => formatInt(entry.requests))),
                      h('span', { style: S.previewTrowValue }, formatInt(totals.requests)),
                    ),
                  ),
                  share !== null
                    ? h('div', { style: S.previewNote }, t('preview.share', { percent: share.toFixed(1), hours: win.hours }))
                    : null,
                ),
        h(
          'div',
          { style: S.previewFoot },
          h('span', null, t('preview.open')),
          h('span', { style: S.previewArrow }, '→'),
        ),
      )
    }

    function dockText(state, t) {
      if (state.data === null) return state.status === 'error' ? t('dock.unavailable') : t('dock.loading')
      const data = state.data
      const parts = []
      const balance = balanceTextOf(data.balance, t)
      if (balance !== undefined && balance !== '') parts.push(t('dock.balance') + ' ' + balance)
      const win = data.window
      if (win != null && data.session != null) {
        const rangeHours = Number.isFinite(win.hours) ? win.hours : 24
        parts.push(t('dock.window', { hours: rangeHours }) + ' ' + formatCost(data.session.cost, data.rates.currency))
      } else {
        parts.push(t('dock.unavailable'))
      }
      return parts.join(' · ')
    }

    function DockLine({ t, store, actions, sessionId }) {
      const state = useUsage(store)
      React.useEffect(() => {
        if (sessionId !== undefined) store.setSession(sessionId)
      }, [sessionId])
      const [open, setOpen] = React.useState(false)
      const [anchor, setAnchor] = React.useState(null)
      const buttonRef = React.useRef(null)
      const timer = React.useRef(undefined)
      const clearClose = () => {
        if (timer.current !== undefined) {
          clearTimeout(timer.current)
          timer.current = undefined
        }
      }
      const measure = () => {
        const button = buttonRef.current
        if (button === null) return
        const rect = button.getBoundingClientRect()
        const half = Math.min(154, Math.max(0, window.innerWidth / 2 - 8))
        const center = Math.max(half, Math.min(window.innerWidth - half, rect.left + rect.width / 2))
        setAnchor({ left: center, bottom: window.innerHeight - rect.top + 8 })
      }
      const show = () => {
        clearClose()
        measure()
        setOpen(true)
        store.refreshIfStale(STALE_MS)
      }
      const scheduleHide = () => {
        clearClose()
        timer.current = setTimeout(() => setOpen(false), 160)
      }
      React.useEffect(() => clearClose, [])
      React.useEffect(() => {
        if (!open) return undefined
        const onResize = () => measure()
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
      }, [open])
      const text = dockText(state, t)
      return h(
        'div',
        {
          style: S.dockWrap,
          'data-token-balance': 'dock',
          onMouseEnter: show,
          onMouseLeave: scheduleHide,
          onFocus: show,
          onBlur: (event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) scheduleHide()
          },
        },
        h(
          'button',
          {
            ref: buttonRef,
            type: 'button',
            style: { ...S.dockButton, background: open ? C.hover : 'transparent', color: open ? C.secondary : C.tertiary },
            'aria-haspopup': 'dialog',
            'aria-expanded': open,
            'aria-label': text + '. ' + t('dock.aria'),
            onClick: () => {
              setOpen(false)
              actions.open()
            },
            onKeyDown: (event) => {
              if (event.key === 'Escape') setOpen(false)
            },
          },
          text,
        ),
        open && anchor !== null
          ? h(HoverPreview, {
              t,
              state,
              anchor,
              onClose: () => setOpen(false),
              onRange: (hours) => store.setHours(hours),
              onOpen: () => {
                setOpen(false)
                actions.open()
              },
            })
          : null,
      )
    }

    function Tabs({ t, tab, onChange }) {
      const items = [
        { id: 'cost', label: t('panel.costTab') },
        { id: 'tokens', label: t('panel.tokensTab') },
      ]
      return h(
        'div',
        { style: S.tabs, role: 'tablist', 'aria-label': t('panel.title') },
        items.map((item) =>
          h(
            'button',
            {
              key: item.id,
              type: 'button',
              role: 'tab',
              'aria-selected': tab === item.id,
              style: tab === item.id ? { ...S.tab, ...S.tabActive } : S.tab,
              onClick: () => onChange(item.id),
              onKeyDown: (event) => {
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                  event.preventDefault()
                  onChange(tab === 'cost' ? 'tokens' : 'cost')
                }
              },
            },
            item.label,
          ),
        ),
      )
    }

    function Chart({ t, buckets, models, metric, currency, width, hoverIndex, onHover, label, axisMax, height = 190 }) {
      const marginLeft = 46
      const marginRight = 6
      const marginTop = 8
      const marginBottom = 22
      const plotWidth = Math.max(80, width - marginLeft - marginRight)
      const plotHeight = height - marginTop - marginBottom
      const slot = plotWidth / buckets.length
      const barWidth = Math.max(3, Math.min(14, slot * 0.55))
      const values = buckets.map((bucket) => bucketValue(bucket, models, metric))
      const max = metric === 'cost' && Number.isFinite(axisMax) && axisMax > 0 ? axisMax : niceMax(Math.max(0, ...values))
      const yOf = (value) => marginTop + plotHeight - (max > 0 ? (value / max) * plotHeight : 0)
      const centerOf = (index) => marginLeft + slot * index + slot / 2
      const ticks = [0, max / 2, max]
      const children = []
      const axisFormat = (value) => (metric === 'cost' ? formatCost(value, currency) : formatTokens(value))
      const firstBucket = buckets[0]
      const lastBucket = buckets[buckets.length - 1]
      const spanHours = firstBucket !== undefined && lastBucket !== undefined ? (lastBucket.end - firstBucket.start) / 3_600_000 : 0
      const relativeWindow = spanHours > 24
      const relativeRange = (bucket) => {
        const end = lastBucket.end
        const startBack = Math.max(0, Math.round((end - bucket.start) / 3_600_000))
        const endBack = Math.max(0, Math.round((end - bucket.end) / 3_600_000))
        return (startBack === 0 ? t('chart.now') : '-' + startBack + 'h') + '–' + (endBack === 0 ? t('chart.now') : '-' + endBack + 'h')
      }

      ticks.forEach((tick, index) => {
        const y = yOf(tick)
        children.push(h('line', { key: 'grid-' + index, x1: marginLeft, x2: width - marginRight, y1: y, y2: y, stroke: C.border1, strokeWidth: 1 }))
        children.push(
          h(
            'text',
            {
              key: 'label-' + index,
              x: marginLeft - 9,
              y: y + 3.5,
              textAnchor: 'end',
              fill: C.caption,
              fontSize: 10,
              fontFamily: C.font,
              style: { fontVariantNumeric: 'tabular-nums' },
            },
            axisFormat(tick),
          ),
        )
      })

      if (hoverIndex !== null && hoverIndex >= 0) {
        children.push(
          h('rect', {
            key: 'band',
            x: marginLeft + slot * hoverIndex,
            y: marginTop,
            width: slot,
            height: plotHeight,
            rx: 4,
            fill: C.hover,
          }),
        )
      }

      buckets.forEach((bucket, index) => {
        let cursor = marginTop + plotHeight
        const opacity = hoverIndex === null || hoverIndex === index ? 1 : 0.42
        models.forEach((model, modelIndex) => {
          const value = modelValue(bucket, model.id, metric)
          if (value <= 0) return
          const segment = (value / max) * plotHeight
          const segmentHeight = segment > 3 ? segment - 1 : segment
          const y = cursor - segment
          children.push(
            h('rect', {
              key: 'bar-' + index + '-' + model.id,
              x: centerOf(index) - barWidth / 2,
              y: y,
              width: barWidth,
              height: segmentHeight,
              rx: Math.min(2, segmentHeight / 2),
              fill: colorOf(model.id, modelIndex),
              opacity,
            }),
          )
          cursor = y
        })
      })

      const lastIndex = buckets.length - 1
      const xIndexes = [0, Math.round(lastIndex * 0.25), Math.round(lastIndex * 0.5), Math.round(lastIndex * 0.75), lastIndex].filter(
        (value, index, array) => array.indexOf(value) === index,
      )
      xIndexes.forEach((index, position) => {
        if (index < 0 || index >= buckets.length) return
        const first = position === 0
        const last = position === xIndexes.length - 1
        children.push(
          h(
            'text',
            {
              key: 'x-' + index,
              x: first ? marginLeft : last ? width - marginRight : centerOf(index),
              y: height - 5,
              textAnchor: first ? 'start' : last ? 'end' : 'middle',
              fill: C.caption,
              fontSize: 10,
              fontFamily: C.font,
            },
            relativeWindow
              ? index === buckets.length - 1
                ? t('chart.now')
                : '-' + Math.round((lastBucket.end - buckets[index].start) / 3_600_000) + 'h'
              : index === buckets.length - 1
                ? t('chart.now')
                : clockOf(buckets[index].start),
          ),
        )
      })

      children.push(
        h('rect', {
          key: 'overlay',
          'data-chart-overlay': '1',
          x: marginLeft,
          y: marginTop,
          width: plotWidth,
          height: plotHeight,
          fill: 'transparent',
          onPointerMove: (event) => {
            const rect = event.currentTarget.getBoundingClientRect()
            const x = event.clientX - rect.left
            const index = Math.max(0, Math.min(buckets.length - 1, Math.floor(x / slot)))
            onHover(index)
          },
          onPointerLeave: () => onHover(null),
        }),
      )

      let tooltip = null
      if (hoverIndex !== null && hoverIndex >= 0 && hoverIndex < buckets.length) {
        const bucket = buckets[hoverIndex]
        const total = bucketValue(bucket, models, metric)
        const requests = models.reduce((sum, model) => sum + numberOrZero((bucket.models[model.id] || {}).requests), 0)
        const left = Math.max(4, Math.min(width - 200, centerOf(hoverIndex) - 98))
        tooltip = h(
          'div',
          { style: { ...S.tooltip, left: left + 'px', top: '4px' } },
          h(
            'div',
            { style: S.tooltipHead },
            h('span', { style: S.tooltipRange }, relativeWindow ? relativeRange(bucket) : rangeOf(bucket)),
            h('span', null, t('tooltip.requests', { count: requests })),
          ),
          models.map((model) =>
            h(
              'div',
              { key: model.id, style: S.tooltipRow },
              h(
                'span',
                { style: S.tooltipLabel },
                h('span', { style: { ...S.tooltipDot, background: colorOf(model.id, models.indexOf(model)) } }),
                h('span', { style: S.tooltipModel }, model.id),
              ),
              h('span', { style: S.tooltipValue }, metric === 'cost' ? formatCostPrecise(modelValue(bucket, model.id, 'cost'), currency) : formatTokens(modelValue(bucket, model.id, 'tokens'))),
            ),
          ),
          h('div', { style: S.tooltipSep }),
          h(
            'div',
            { style: S.tooltipRow },
            h('span', { style: { color: C.secondary } }, t('tooltip.total')),
            h('span', { style: { ...S.tooltipValue, fontWeight: 600 } }, metric === 'cost' ? formatCostPrecise(total, currency) : formatTokens(total)),
          ),
          metric === 'cost' ? h('div', { style: S.tooltipFoot }, formatTokens(bucketValue(bucket, models, 'tokens')) + ' ' + t('dock.tokens')) : null,
        )
      }

      return h(
        'div',
        { style: S.chartWrap },
        h('svg', { width: width, height: height, viewBox: '0 0 ' + width + ' ' + height, role: 'img', 'aria-label': (label || '') + '. ' + t('panel.hint') }, children),
        tooltip,
      )
    }


    function Breakdown({ t, breakdown, currency, width }) {
      const projects = breakdown.projects === undefined ? [] : breakdown.projects
      const sessions = breakdown.sessions === undefined ? [] : breakdown.sessions
      const categories = breakdown.categories === undefined ? [] : breakdown.categories
      const sideMargin = Math.max(12, Math.round(width * 0.06))
      const gutter = Math.max(16, Math.round(width * 0.15))
      const donutSize = Math.max(96, Math.floor((width - sideMargin * 2 - gutter) / 2))
      const donutBand = Math.max(10, Math.round(donutSize * 0.08))
      const palette = ['#3aa0ff', '#f5a623', '#3fbf7f', '#c084fc', '#ff6464', '#5ac8fa', '#e879f9']
      const compact = (rows) => {
        if (rows.length <= 6) return rows
        const head = rows.slice(0, 5)
        const other = rows.slice(5).reduce((sum, row) => ({ name: t('panel.other'), cost: sum.cost + row.cost, totalTokens: sum.totalTokens + row.totalTokens }), { cost: 0, totalTokens: 0 })
        return [...head, other]
      }
      const [hover, setHover] = React.useState(null)
      const projectPalette = ['#3aa0ff', '#3fbf7f', '#c084fc', '#5ac8fa', '#8ea3b8', '#e879f9', '#7fd1ff']
      const categoryPalette = ['#f5a623', '#ff6464', '#e879f9', '#3fbf7f', '#5ac8fa', '#fbbf24', '#a78bfa']
      const donut = (label, rows, palette, size, band) => {
        const data = compact(rows)
        const total = data.reduce((sum, row) => sum + row.cost, 0)
        const center = size / 2
        const radius = center - 2 - band / 2
        const circumference = 2 * Math.PI * radius
        let offset = 0
        const segments = total <= 0
          ? [h('circle', { key: 'empty', cx: center, cy: center, r: radius, fill: 'none', stroke: '#25405a', strokeWidth: band })]
          : data.map((row, index) => {
              const fraction = total > 0 ? row.cost / total : 0
              const dash = fraction * circumference
              const segment = h('circle', {
                key: row.name,
                cx: center,
                cy: center,
                r: radius,
                fill: 'none',
                stroke: palette[index % palette.length],
                strokeWidth: band,
                strokeDasharray: dash + ' ' + (circumference - dash),
                strokeDashoffset: String(-offset),
                transform: 'rotate(-90 ' + center + ' ' + center + ')',
                style: { cursor: 'pointer' },
                onMouseEnter: () => setHover({ chart: label, name: row.name, cost: row.cost, percent: fraction * 100 }),
                onMouseLeave: () => setHover(null),
              })
              offset += dash
              return segment
            })
        return h(
          'div',
          { style: { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' } },
          hover !== null && hover.chart === label
            ? h('div', { style: { position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', background: '#0b1622', border: '1px solid #25405a', borderRadius: '6px', padding: '3px 6px', fontSize: '10px', whiteSpace: 'nowrap', zIndex: 2 } },
                hover.name + ' · ' + formatCost(hover.cost, currency) + ' (' + hover.percent.toFixed(0) + '%)')
            : null,
          h('svg', { width: size, height: size, viewBox: '0 0 ' + size + ' ' + size, role: 'img', 'aria-label': label }, segments),
          h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' } },
            data.map((row, index) => h('div', { key: row.name, style: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9.5px', color: '#b8c7d6' } },
              h('span', { style: { width: '6px', height: '6px', borderRadius: '50%', background: palette[index % palette.length] } }),
              row.name,
              total > 0 ? h('span', { style: { color: '#657a8f' } }, Math.round((row.cost / total) * 100) + '%') : null,
            )),
          ),
          h('div', { style: { fontSize: '10px', color: '#8ea3b8' } }, label),
        )
      }
      const rows = []
      for (const project of projects) {
        rows.push(h('tr', { key: 'p-' + project.name, style: { borderTop: '1px solid #1e3349' } },
          h('td', { style: { padding: '4px 6px', fontWeight: 600 } }, project.name),
          h('td', { style: { padding: '4px 6px', color: '#657a8f', fontSize: '11px' } }, '—'),
          h('td', { style: { padding: '4px 6px', textAlign: 'right' } }, formatCost(project.cost, currency)),
          h('td', { style: { padding: '4px 6px', textAlign: 'right' } }, formatTokens(project.totalTokens)),
        ))
        for (const session of project.sessions) {
          rows.push(h('tr', { key: 's-' + session.id },
            h('td', { style: { padding: '3px 6px 3px 20px', color: '#8ea3b8', fontSize: '11px' } }, session.title),
            h('td', { style: { padding: '3px 6px', color: '#8ea3b8', fontSize: '10.5px' } }, t('kind.' + (session.kind ?? 'undefined'))),
            h('td', { style: { padding: '3px 6px', textAlign: 'right', fontSize: '11px' } }, formatCost(session.cost, currency)),
            h('td', { style: { padding: '3px 6px', textAlign: 'right', fontSize: '11px' } }, formatTokens(session.totalTokens)),
          ))
        }
      }
      return h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #1e3349', paddingTop: '10px' } },
        h('div', { style: { display: 'flex', justifyContent: 'space-between', gap: gutter + 'px', padding: '0 ' + sideMargin + 'px' } }, [donut(t('panel.byProject'), projects, projectPalette, donutSize, donutBand), donut(t('panel.byKind'), categories.map((category) => ({ ...category, name: t('kind.' + category.name) })), categoryPalette, donutSize, donutBand)]),
        h('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' } },
          h('thead', null, h('tr', null,
            h('th', { style: { textAlign: 'left', padding: '4px 6px', fontSize: '10px', color: '#657a8f', textTransform: 'uppercase' } }, t('panel.project')),
            h('th', { style: { textAlign: 'left', padding: '4px 6px', fontSize: '10px', color: '#657a8f', textTransform: 'uppercase' } }, t('panel.kind')),
            h('th', { style: { textAlign: 'right', padding: '4px 6px', fontSize: '10px', color: '#657a8f', textTransform: 'uppercase' } }, t('panel.cost')),
            h('th', { style: { textAlign: 'right', padding: '4px 6px', fontSize: '10px', color: '#657a8f', textTransform: 'uppercase' } }, t('panel.tokens')),
          )),
          h('tbody', null, rows),
        ),
      )
    }

    function UsagePanel({ t, store, sessionId }) {
      const state = useUsage(store)
      const [consumptionOpen, setConsumptionOpen] = React.useState(true)
      React.useEffect(() => {
        if (sessionId !== undefined) store.setSession(sessionId)
      }, [sessionId])
      const [hoverIndex, setHoverIndex] = React.useState(null)
      const [width, setWidth] = React.useState(320)
      const [axisChoice, setAxisChoice] = React.useState('auto')
      const chartRef = React.useRef(null)
      React.useEffect(() => {
        store.refreshIfStale(STALE_MS)
      }, [])
      React.useEffect(() => {
        const element = chartRef.current
        if (element === null || typeof ResizeObserver !== 'function') return undefined
        const observer = new ResizeObserver((entries) => {
          const measured = entries[0] === undefined ? 0 : entries[0].contentRect.width
          if (measured > 0) setWidth(Math.max(220, Math.round(measured)))
        })
        observer.observe(element)
        return () => observer.disconnect()
      }, [state.data])
      const data = state.data
      const win = data === null || data.window == null ? undefined : data.window
      const currency = data === null || data.rates == null ? 'USD' : data.rates.currency
      const models = win === undefined ? [] : win.models
      const totals = win === undefined ? null : win.totals
      const empty = win === undefined || win.totals.requests === 0
      const metric = 'cost'
      const axisOptions = [0.5, 1, 1.5, 2, 5, 10, 20, 50, 100]
      const costMax = win === undefined ? 0 : Math.max(0, ...win.buckets.map((bucket) => bucketValue(bucket, models, 'cost')))
      const fitAxis = (value) => axisOptions.find((range) => range >= value) ?? 100
      const chartAxisMax = fitAxis(axisChoice === 'auto' ? costMax : Math.max(Number(axisChoice), costMax))
      const statsList =
        totals === null
          ? []
          : [
              [t('stat.cost'), formatCost(totals.cost, currency)],
              [t('stat.requests'), formatInt(totals.requests)],
              [t('stat.tokens'), formatTokens(totals.totalTokens)],
            ]
      const balanceText = data === null ? undefined : balanceTextOf(data.balance, t)
      const bucketMs = win === undefined ? 3_600_000 : win.bucketMs
      const chartTitle =
        bucketMs < 3_600_000
          ? t('panel.costPer30m')
          : bucketMs > 3_600_000
            ? t('panel.costPer2h')
            : t('panel.costByHour')

      const content = []
      content.push(
        h(
          'div',
          { key: 'balance', style: S.balanceBanner },
          h('span', { style: S.balanceBig }, balanceText === undefined ? '—' : balanceText),
          h('span', { style: S.balanceBannerLabel }, t('panel.balance')),
          h(
            'a',
            { href: 'https://platform.deepseek.com/top_up', target: '_blank', rel: 'noreferrer', style: S.topUp },
            t('panel.topUp') + ' ↗',
          ),
        ),
      )
      content.push(h('div', { key: 'balance-gap', style: { height: '24px' } }))
      content.push(
        h(
          'div',
          { key: 'range', style: { display: 'flex', alignItems: 'center', marginBottom: '10px' } },
          h(RangePicker, { t, hours: state.hours, onChange: (hours) => store.setHours(hours) }),
        ),
      )

      if (data === null) {
        content.push(h('div', { key: 'loading', style: S.loading }, state.status === 'error' ? t('panel.error') : t('panel.loading')))
        if (state.status === 'error') {
          content.push(
            h(
              'div',
              { key: 'retry', style: S.emptyBox },
              h('button', { type: 'button', style: S.retry, onClick: () => store.refresh() }, t('panel.retry')),
            ),
          )
        }
      } else if (data.window == null) {
        content.push(
          h(
            'div',
            { key: 'error', style: S.emptyBox },
            h('span', null, t('panel.error')),
            h('button', { type: 'button', style: S.retry, onClick: () => store.refresh() }, t('panel.retry')),
          ),
        )
      } else {
        if (statsList.length > 0) {
          content.push(
            h(
              'div',
              { key: 'stats', style: S.stats },
              statsList.map((entry, index) =>
                h(
                  'div',
                  { key: entry[0], style: { ...(index === 0 ? { ...S.stat, ...S.statFirst } : S.stat), textAlign: 'center' } },
                  h('div', { style: S.statValue }, entry[1]),
                  h('div', { style: S.statLabel }, entry[0]),
                ),
              ),
            ),
          )
        }
        content.push(
          h(
            'div',
            { key: 'controls', style: { display: 'flex', alignItems: 'center', gap: '8px' } },
            h(
              'span',
              { style: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#8ea3b8' } },
              h('span', null, t('panel.axis')),
              h(
                'select',
                { style: { background: '#132334', color: '#e7eef7', border: '1px solid #25405a', borderRadius: '6px', padding: '2px 6px', fontSize: '11px' }, value: axisChoice, onChange: (event) => setAxisChoice(event.target.value) },
                [h('option', { key: 'auto', value: 'auto' }, t('panel.axisAuto'))].concat(
                  axisOptions.map((range) => h('option', { key: String(range), value: String(range) }, '$' + range.toFixed(2))),
                ),
              ),
            ),
          ),
        )
        content.push(
          h(
            'div',
            { key: 'chart-head', style: S.chartHead },
            h('span', { style: S.chartTitle }, chartTitle),
            h(
              'div',
              { style: S.legend },
              models.map((model) =>
                h(
                  'span',
                  { key: model.id, style: S.legendItem },
                  h('span', { style: { ...S.legendSwatch, background: colorOf(model.id, models.indexOf(model)) } }),
                  model.id,
                ),
              ),
            ),
          ),
        )
        content.push(
          h(
            'div',
            { key: 'chart', ref: chartRef, style: { width: '100%' } },
            empty
              ? h('div', { style: S.emptyBox }, t('panel.empty'))
              : h(Chart, {
                  t,
                  buckets: win.buckets,
                  models,
                  metric,
                  currency,
                  width,
                  hoverIndex,
                  axisMax: chartAxisMax,
                  label: chartTitle,
                  height: consumptionOpen ? 190 : 300,
                  onHover: (index) => setHoverIndex(index),
                }),
          ),
        )
        content.push(
          h(
            'button',
            { key: 'consumption-head', type: 'button', onClick: () => setConsumptionOpen((open) => !open), style: { display: 'flex', alignItems: 'center', gap: '8px', width: '100%', background: 'transparent', border: 'none', borderTop: '1px solid #1e3349', color: '#e7eef7', fontSize: '12px', fontWeight: 600, padding: '9px 0 0', marginTop: '8px', cursor: 'pointer' } },
            t('panel.breakdown'),
            h('span', { style: { marginLeft: 'auto', color: '#8ea3b8', fontWeight: 400 } }, consumptionOpen ? '▾' : '▸'),
          ),
        )
        if (consumptionOpen && data.breakdown !== undefined) {
          content.push(h(Breakdown, { key: 'breakdown', t, breakdown: data.breakdown, currency, width }))
        }
        content.push(
          h(
            'div',
            { key: 'foot', style: S.foot },
            h('span', null, t('panel.foot')),
            h('span', null, t('panel.updated', { when: timeAgo(data.updatedAt, t) })),
          ),
        )
      }

      return h('div', { style: S.panel, role: 'region', 'aria-label': t('panel.title') }, content)
    }

    return {
      inject: ['slots', 'locale', 'sidebarRightTabs', 'sidebarRight'],
      apply(ctx) {
        let t = (key) => key
        try {
          if (ctx.locale !== undefined && typeof ctx.locale.register === 'function') {
            ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'token-balance: locale')
            t = ctx.locale.bind(NS)
          }
        } catch {
          // Locale is optional; fall back to the key itself.
        }
        const store = createStore()
        const actions = { open: () => {} }

        ctx.slots.inject('conversation.composer.dock', () =>
          ctx.slots.register(
            { name: 'conversation.composer.dock', id: 'token-balance', order: 2 },
            (props) => h(DockLine, { ...props, t, store, actions }),
          ),
        )

        ctx.effect(
          () =>
            ctx.sidebarRightTabs.register({
              id: TYPE_ID,
              kind: KIND,
              title: () => t('panel.title'),
              guide: [{
                id: 'usage',
                order: 10,
                title: () => t('guide.title'),
                description: () => t('guide.description'),
              }],
            }),
          'token-balance: usage tab type',
        )
        ctx.effect(
          () =>
            ctx.slots.inject('sidebar.right.pane.tab', () =>
              ctx.slots.register(
                { name: 'sidebar.right.pane.tab', key: TYPE_ID, locale: NS },
                (props) => h(UsagePanel, { ...props, t: props.t !== undefined ? props.t : t, store }),
              ),
            ),
          'token-balance: usage tab body',
        )
        actions.open = () => {
          try {
            ctx.sidebarRight.openTab(KIND)
          } catch {
            // No Session is mounted; the dock only exists with one, so this is a transient state.
          }
        }
      },
    }
  },
})
