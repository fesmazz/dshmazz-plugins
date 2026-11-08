/**
 * Session usage report.
 *
 * Pure aggregation over one session's live agents: Team rows (Lead and
 * teammates) and Subagent rows are kept separate, with token totals and
 * estimated cost from the active rate card.
 */

import { costOf } from './rates.js'
import { addUsage, emptyUsage } from './usage.js'

/**
 * Summarize agent usage.
 * @param agents - `{ id, name, role, provider, model, usage }` rows.
 * @param card - active rate card.
 * @returns team/subagent rows, totals, and a per-model breakdown.
 */
export function summarizeAgents(agents, card) {
  const team = []
  const subagents = []
  const byModel = new Map()
  let usage = emptyUsage()
  let cost = 0

  for (const agent of agents) {
    const estimate = agent.provider === undefined || agent.model === undefined
      ? undefined
      : costOf(card, agent.provider, agent.model, agent.usage)
    const row = {
      id: agent.id,
      name: agent.name,
      role: agent.role,
      status: agent.status ?? null,
      provider: agent.provider ?? null,
      model: agent.model ?? null,
      usage: agent.usage,
      cost: estimate === undefined ? null : estimate.total,
    }
    if (agent.role === 'lead' || agent.role === 'teammate') team.push(row)
    else subagents.push(row)
    usage = addUsage(usage, agent.usage)
    if (estimate !== undefined) cost += estimate.total
    if (estimate !== undefined) {
      const key = `${agent.provider}\u0000${agent.model}`
      const entry = byModel.get(key) ?? {
        provider: agent.provider,
        model: agent.model,
        usage: emptyUsage(),
        cost: 0,
      }
      entry.usage = addUsage(entry.usage, agent.usage)
      entry.cost += estimate.total
      byModel.set(key, entry)
    }
  }

  return {
    team,
    subagents,
    totals: { usage, cost: Math.round(cost * 1e6) / 1e6 },
    byModel: [...byModel.values()].map((entry) => ({ ...entry, cost: Math.round(entry.cost * 1e6) / 1e6 })),
  }
}
