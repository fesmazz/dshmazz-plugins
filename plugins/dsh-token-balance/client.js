window.__ModuleLoader__.load({
  id: '@mazz/dsh-token-balance',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'dsh-token-balance'

    const en = {
      balance: 'Balance',
      tokens: 'Tokens',
      loading: '…',
      noKey: 'No DeepSeek API key',
      unavailable: 'Balance unavailable',
      input: 'in',
      output: 'out',
      cache: 'cache',
    }
    const zh = {
      balance: '余额',
      tokens: 'Token',
      loading: '…',
      noKey: '未配置 DeepSeek API Key',
      unavailable: '余额不可用',
      input: '输入',
      output: '输出',
      cache: '缓存',
    }

    function trimNumber(value) {
      if (!Number.isFinite(value) || value <= 0) return '0'
      if (value >= 1e9) return (value / 1e9).toFixed(1).replace(/\.0$/, '') + 'B'
      if (value >= 1e6) return (value / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
      if (value >= 1e3) return (value / 1e3).toFixed(1).replace(/\.0$/, '') + 'k'
      return String(Math.round(value))
    }

    function symbolOf(currency) {
      if (currency === 'CNY') return '¥'
      if (currency === 'USD') return '$'
      return ''
    }

    function balanceTextOf(balance, t) {
      if (balance === null || balance === undefined) return undefined
      if (balance.configured === false) return t('noKey')
      if (typeof balance.error === 'string' && balance.error.length > 0) return balance.error
      const symbol = symbolOf(balance.currency)
      const amount = balance.total
      if (amount === null || amount === undefined || amount === '') return t('unavailable')
      const numeric = Number(amount)
      return symbol + (Number.isFinite(numeric) ? numeric.toFixed(2) : amount)
    }

    function usageTextOf(usage, t) {
      if (usage === null || usage === undefined) return undefined
      const input = typeof usage.inputTokens === 'number' ? usage.inputTokens : 0
      const output = typeof usage.outputTokens === 'number' ? usage.outputTokens : 0
      const cache = typeof usage.cacheReadTokens === 'number' ? usage.cacheReadTokens : 0
      if (input === 0 && output === 0 && cache === 0) return t('tokens') + ' 0'
      let text = t('tokens') + ' ↑' + trimNumber(input) + ' ↓' + trimNumber(output)
      if (cache > 0) text += ' ' + t('cache') + ' ' + trimNumber(cache)
      return text
    }

    function TokenBalance(props) {
      const sessionId = props.sessionId
      const t = props.t
      const [state, setState] = React.useState({ status: 'loading', data: null, error: null })

      React.useEffect(() => {
        let alive = true
        let timer = null
        const load = async () => {
          try {
            const query = sessionId === undefined || sessionId === null ? '' : '?sessionId=' + encodeURIComponent(String(sessionId))
            const response = await fetch('/dsh-token-balance' + query, { headers: { accept: 'application/json' } })
            const data = await response.json()
            if (alive) setState({ status: 'ready', data, error: null })
          } catch (error) {
            if (alive) setState({ status: 'error', data: null, error: error instanceof Error ? error.message : String(error) })
          }
        }
        load()
        timer = setInterval(load, 20000)
        return () => {
          alive = false
          if (timer !== null) clearInterval(timer)
        }
      }, [sessionId])

      const data = state.data
      const balance = data === null ? undefined : data.balance
      const usage = data === null ? undefined : data.sessionUsage ?? data.globalUsage
      const parts = []

      if (state.status === 'loading') {
        parts.push(t('loading'))
      } else if (state.status === 'error') {
        parts.push(t('unavailable'))
      } else {
        const balanceText = balanceTextOf(balance, t)
        if (balanceText !== undefined) parts.push(t('balance') + ' ' + balanceText)
        const usageText = usageTextOf(usage, t)
        if (usageText !== undefined) parts.push(usageText)
      }

      return h(
        'div',
        {
          'data-token-balance': 'dock',
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            fontSize: '12px',
            lineHeight: '18px',
            color: 'var(--dsw-alias-label-tertiary)',
            padding: '0 2px',
            userSelect: 'none',
          },
        },
        h('span', null, parts.join('  ·  ')),
      )
    }

    return {
      inject: ['slots', 'locale'],
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
        ctx.slots.inject('conversation.composer.dock', () =>
          ctx.slots.register(
            { name: 'conversation.composer.dock', id: 'token-balance', order: 2 },
            (props) => h(TokenBalance, { ...props, t }),
          ),
        )
      },
    }
  },
})
