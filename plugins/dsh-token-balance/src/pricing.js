/**
 * Estimated spend from provider-reported token counts and DeepSeek list prices.
 *
 * Prices are per 1M tokens in USD and differ between peak and off-peak hours.
 * The shipped `rates.json` mirrors the official table (see its `docs` field);
 * edit that file (or pass a `rates` object in the plugin config) to correct or
 * extend it. Chinese public holidays are not modelled, so peak-hour estimates
 * on those days can be high.
 *
 * @module pricing
 */

/** The rate table used when `rates.json` is missing or malformed. */
export const DEFAULT_RATES = Object.freeze({
  currency: 'USD',
  unit: 'per 1M tokens',
  source: 'defaults',
  docs: 'https://api-docs.deepseek.com/quick_start/pricing',
  fetched: '2026-10-17',
  peakHoursUtc: [[1, 4], [6, 10]],
  peakWeekdaysUtc: [1, 2, 3, 4, 5],
  models: {
    'deepseek-flash': {
      peak: { cacheHit: 0.006, cacheMiss: 0.3, output: 1.2, cacheWrite: 0 },
      offPeak: { cacheHit: 0.003, cacheMiss: 0.15, output: 0.6, cacheWrite: 0 },
    },
    'deepseek-v4-pro': {
      peak: { cacheHit: 0.044, cacheMiss: 1.32, output: 3.96, cacheWrite: 0 },
      offPeak: { cacheHit: 0.022, cacheMiss: 0.66, output: 1.98, cacheWrite: 0 },
    },
  },
})

function finiteNumber(value, fallback) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback
}

function normalizeTier(input, fallback) {
  const source = input !== null && typeof input === 'object' ? input : {}
  return {
    cacheHit: finiteNumber(source.cacheHit, fallback.cacheHit),
    cacheMiss: finiteNumber(source.cacheMiss, fallback.cacheMiss),
    output: finiteNumber(source.output, fallback.output),
    cacheWrite: finiteNumber(source.cacheWrite, fallback.cacheWrite ?? 0),
  }
}

function normalizeModel(input, fallback) {
  const source = input !== null && typeof input === 'object' ? input : {}
  return {
    peak: normalizeTier(source.peak, fallback.peak),
    offPeak: normalizeTier(source.offPeak, fallback.offPeak),
  }
}

function normalizeHours(input, fallback) {
  if (!Array.isArray(input)) return fallback
  const hours = input
    .filter(
      (pair) =>
        Array.isArray(pair) &&
        pair.length === 2 &&
        Number.isInteger(pair[0]) &&
        Number.isInteger(pair[1]) &&
        pair[0] >= 0 &&
        pair[1] <= 24 &&
        pair[0] < pair[1],
    )
    .map(([start, end]) => [start, end])
  return hours.length > 0 ? hours : fallback
}

/**
 * Validate and complete a rate table, filling missing values from the defaults.
 * @param input - untrusted table (the parsed `rates.json` or plugin config).
 * @param source - short label describing where the table came from.
 * @returns a complete, plain-object rate table.
 */
export function normalizeRates(input, source = 'rates.json') {
  const base = DEFAULT_RATES
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    return { ...base, source, peakHoursUtc: base.peakHoursUtc.map((pair) => [...pair]), peakWeekdaysUtc: [...base.peakWeekdaysUtc], models: normalizeModels(undefined) }
  }
  return {
    currency: typeof input.currency === 'string' && input.currency.length > 0 ? input.currency : base.currency,
    unit: typeof input.unit === 'string' && input.unit.length > 0 ? input.unit : base.unit,
    source,
    docs: typeof input.docs === 'string' ? input.docs : base.docs,
    fetched: typeof input.fetched === 'string' ? input.fetched : base.fetched,
    peakHoursUtc: normalizeHours(input.peakHoursUtc, base.peakHoursUtc),
    peakWeekdaysUtc: normalizeWeekdays(input.peakWeekdaysUtc, base.peakWeekdaysUtc),
    models: normalizeModels(input.models),
  }
}

function normalizeModels(models) {
  const result = {}
  for (const [id, definition] of Object.entries(DEFAULT_RATES.models)) {
    result[id] = normalizeModel(models?.[id], definition)
  }
  for (const [id, definition] of Object.entries(models ?? {})) {
    if (result[id] !== undefined) continue
    const fallback = DEFAULT_RATES.models['deepseek-flash']
    result[id] = normalizeModel(definition, fallback)
  }
  return result
}

function normalizeWeekdays(input, fallback) {
  if (!Array.isArray(input)) return fallback
  const days = input.filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
  return days.length > 0 ? [...new Set(days)] : fallback
}

/**
 * Whether a moment falls in a peak-priced hour.
 * @param timeMs - epoch milliseconds of the request.
 * @param rates - normalized rate table.
 * @returns true for a weekday peak hour in UTC.
 */
export function isPeak(timeMs, rates = DEFAULT_RATES) {
  if (typeof timeMs !== 'number' || !Number.isFinite(timeMs)) return false
  const date = new Date(timeMs)
  const day = date.getUTCDay()
  if (!rates.peakWeekdaysUtc.includes(day)) return false
  const hour = date.getUTCHours()
  return rates.peakHoursUtc.some(([start, end]) => hour >= start && hour < end)
}

/** Resolve the list-price row for one model, falling back to the flash row. */
export function modelRates(rates, model) {
  if (rates.models[model] !== undefined) return rates.models[model]
  if (rates.models['deepseek-flash'] !== undefined) return rates.models['deepseek-flash']
  return Object.values(rates.models)[0]
}

/** The peak or off-peak row that applies at `timeMs`. */
export function ratesFor(rates, model, timeMs) {
  const definition = modelRates(rates, model)
  return isPeak(timeMs, rates) ? definition.peak : definition.offPeak
}

/**
 * Estimate one usage record's cost.
 * @param rates - normalized rate table.
 * @param model - provider model id.
 * @param timeMs - epoch milliseconds of the request.
 * @param usage - token counts, in the harness spelling.
 * @returns cost in `rates.currency`, or 0 for malformed input.
 */
export function costOfUsage(rates, model, timeMs, usage) {
  if (usage === null || typeof usage !== 'object') return 0
  const row = ratesFor(rates, model, timeMs)
  const perMillion = 1_000_000
  const cost =
    (finiteNumber(usage.inputTokens, 0) * row.cacheMiss +
      finiteNumber(usage.cacheReadTokens, 0) * row.cacheHit +
      finiteNumber(usage.cacheWriteTokens, 0) * (row.cacheWrite ?? 0) +
      finiteNumber(usage.outputTokens, 0) * row.output) /
    perMillion
  return Number.isFinite(cost) ? cost : 0
}
