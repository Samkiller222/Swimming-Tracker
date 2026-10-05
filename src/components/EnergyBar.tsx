import { ENERGY_SYSTEMS, type EnergySystem } from '../lib/types'

/** Compact stacked bar showing how a session's distance splits across energy systems. */
export function EnergyBar({
  byEnergy,
  total,
}: {
  byEnergy: Partial<Record<EnergySystem, number>>
  total: number
}) {
  if (total === 0) return null
  return (
    <div className="energy-bar" role="img" aria-label="Distance by energy system">
      {ENERGY_SYSTEMS.filter((e) => byEnergy[e.code]).map((e) => (
        <span
          key={e.code}
          className={`energy-seg energy-${e.code}`}
          style={{ flexGrow: byEnergy[e.code] }}
          title={`${e.label}: ${byEnergy[e.code]}m`}
        />
      ))}
    </div>
  )
}

/** One labelled track per energy system, in the design system's stat-list style. */
export function EnergyStatList({
  byEnergy,
  total,
}: {
  byEnergy: Partial<Record<EnergySystem, number>>
  total: number
}) {
  const parts = ENERGY_SYSTEMS.filter((e) => byEnergy[e.code])
  if (parts.length === 0) return null
  return (
    <div className="cr-stat-list">
      {parts.map((e) => {
        const metres = byEnergy[e.code] ?? 0
        const pct = Math.round((metres / total) * 100)
        return (
          <div key={e.code}>
            <div className="cr-stat-head">
              <span className="cr-stat-label">
                <span className={`swatch energy-${e.code}`} />
                {e.label}
              </span>
              <span className="cr-stat-count">
                {metres}m · {pct}%
              </span>
            </div>
            <div className="cr-stat-track">
              <div className={`cr-stat-fill energy-${e.code}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
