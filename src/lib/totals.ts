import type { EnergySystem, Session, SwimSet } from './types'

export function setDistance(set: SwimSet): number {
  return set.reps * set.distance
}

/** Time a set takes on its send-off, or null when it has none. */
export function setTime(set: SwimSet): number | null {
  return set.sendOff === null ? null : set.reps * set.sendOff
}

export interface SessionTotals {
  distance: number
  /** Total seconds across sets that have a send-off. */
  time: number
  /** True when at least one set has no send-off, so `time` undercounts. */
  timeIsPartial: boolean
  byEnergy: Partial<Record<EnergySystem, number>>
}

export function sessionTotals(sets: SwimSet[]): SessionTotals {
  const totals: SessionTotals = { distance: 0, time: 0, timeIsPartial: false, byEnergy: {} }
  for (const set of sets) {
    const d = setDistance(set)
    totals.distance += d
    totals.byEnergy[set.energy] = (totals.byEnergy[set.energy] ?? 0) + d
    const t = setTime(set)
    if (t === null) totals.timeIsPartial = true
    else totals.time += t
  }
  return totals
}

export interface MonthGroup {
  /** YYYY-MM */
  month: string
  sessions: Session[]
  distance: number
}

/** Groups sessions by month, newest first, and sorts each month newest first. */
export function groupByMonth(sessions: Session[]): MonthGroup[] {
  const sorted = [...sessions].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
  )
  const groups: MonthGroup[] = []
  for (const s of sorted) {
    const month = s.date.slice(0, 7)
    let group = groups[groups.length - 1]
    if (!group || group.month !== month) {
      group = { month, sessions: [], distance: 0 }
      groups.push(group)
    }
    group.sessions.push(s)
    group.distance += sessionTotals(s.sets).distance
  }
  return groups
}
