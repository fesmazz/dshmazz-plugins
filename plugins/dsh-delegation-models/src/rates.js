/**
 * Rate cards for cost estimates.
 *
 * A bundled snapshot copied and generalized from the owner's current guidelines
 * on 2026-11-07 is the default. A custom card may replace it when it passes
 * {@link validateRateCard}. Costs are estimates, never billing.
 */

/** Unit the numeric fields are expressed in. */
export const RATE_UNIT = 'per_1m_tokens'

/** Bundled snapshot used when no custom card is stored. */
export const BUNDLED_RATES = Object.freeze({
  version: 1,
  currency: 'USD',
  unit: RATE_UNIT,
  note: 'Bundled snapshot copied 2026-11-07 from the owner guidelines; estimates only.',
  models: Object.freeze([
    Object.freeze({
      provider: 'deepseek-account',
      model: 'deepseek-flash',
      input: 0.28,
      cacheRead: 0.028,
      cacheWrite: 0.28,
      output: 1.1,
    }),
    Object.freeze({
      provider: 'deepseek-account',
      model: 'deepseek-v4-pro',
      input: 0.55,
      cacheRead: 0.055,
      cacheWrite: 0.55,
      output: 2.2,
    }),
  ]),
})

const NUMERIC_FIELDS = ['input', 'cacheRead', 'cacheWrite', 'output']

function isText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function isNonNegative(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

/**
 * Validate a rate card and normalize it to plain numbers.
 * @param value - candidate card, for example parsed from a template file.
 * @returns `{ ok, errors, card }`; `card` is present only when valid.
 */
export function validateRateCard(value) {
  const errors = []
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, errors: ['rate card must be an object'] }
  }
  if (value.version !== 1) errors.push('`version` must be 1')
  if (!isText(value.currency)) errors.push('`currency` must be a non-empty string')
  if (value.unit !== RATE_UNIT) errors.push(`\`unit\` must be "${RATE_UNIT}"`)
  if (!Array.isArray(value.models) || value.models.length === 0) {
    errors.push('`models` must be a non-empty array')
    return { ok: false, errors }
  }
  const seen = new Set()
  const models = []
  value.models.forEach((entry, index) => {
    const path = `models[${index}]`
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
      errors.push(`${path} must be an object`)
      return
    }
    if (!isText(entry.provider)) errors.push(`${path}.provider must be a non-empty string`)
    if (!isText(entry.model)) errors.push(`${path}.model must be a non-empty string`)
    const key = `${String(entry.provider)}/${String(entry.model)}`
    if (seen.has(key)) errors.push(`${path} repeats ${key}`)
    seen.add(key)
    for (const field of NUMERIC_FIELDS) {
      if (!isNonNegative(entry[field])) errors.push(`${path}.${field} must be a non-negative number`)
    }
    models.push({
      provider: String(entry.provider),
      model: String(entry.model),
      input: entry.input,
      cacheRead: entry.cacheRead,
      cacheWrite: entry.cacheWrite,
      output: entry.output,
    })
  })
  if (errors.length > 0) return { ok: false, errors }
  return {
    ok: true,
    errors: [],
    card: {
      version: 1,
      currency: value.currency,
      unit: RATE_UNIT,
      ...isText(value.note) ? { note: value.note } : {},
      models,
    },
  }
}

/**
 * Find the rate row for one exact provider/model route.
 * @param card - a validated or bundled card.
 * @param provider - LLM provider route.
 * @param model - model id.
 * @returns the matching row, or undefined.
 */
export function rateFor(card, provider, model) {
  return card.models.find((entry) => entry.provider === provider && entry.model === model)
}

/**
 * Estimate cost for one usage record.
 * @param card - a validated or bundled card.
 * @param provider - LLM provider route.
 * @param model - model id.
 * @param usage - token counts with `inputTokens`, `outputTokens`, `cacheReadTokens`, `cacheWriteTokens`.
 * @returns cost in the card currency, or undefined when the route has no rate.
 */
export function costOf(card, provider, model, usage) {
  const rate = rateFor(card, provider, model)
  if (rate === undefined) return undefined
  const input = Number(usage.inputTokens) || 0
  const output = Number(usage.outputTokens) || 0
  const cacheRead = Number(usage.cacheReadTokens) || 0
  const cacheWrite = Number(usage.cacheWriteTokens) || 0
  const parts = {
    input: round6((input / 1e6) * rate.input),
    output: round6((output / 1e6) * rate.output),
    cacheRead: round6((cacheRead / 1e6) * rate.cacheRead),
    cacheWrite: round6((cacheWrite / 1e6) * rate.cacheWrite),
  }
  return { ...parts, total: round6(parts.input + parts.output + parts.cacheRead + parts.cacheWrite) }
}

/** Keep cost output stable at six decimal places. */
function round6(value) {
  return Math.round(value * 1e6) / 1e6
}
