import { ENERGY_SYSTEMS, type EnergySystem } from '../lib/types'

/** Horizontal stacked bar showing how a session's distance splits across energy systems. */
export function EnergyBar({
  byEnergy,
  total,
  showLegend = false,
}: {
  byEnergy: Partial<Record<EnergySystem, number>>
  total: number
  showLegend?: boolean
}) {
  if (total === 0) return null
  const parts = ENERGY_SYSTEMS.filter((e) => byEnergy[e.code])
  return (
    <div className="energy">
      <div className="energy-bar" role="img" aria-label="Distance by energy system">
        {parts.map((e) => (
          <span
            key={e.code}
            className={`energy-seg energy-${e.code}`}
            style={{ flexGrow: byEnergy[e.code] }}
            title={`${e.label}: ${byEnergy[e.code]}m`}
          />
        ))}
      </div>
      {showLegend && (
        <ul className="energy-legend">
          {parts.map((e) => (
            <li key={e.code}>
              <span className={`swatch energy-${e.code}`} />
              {e.code} {byEnergy[e.code]}m ({Math.round(((byEnergy[e.code] ?? 0) / total) * 100)}%)
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
