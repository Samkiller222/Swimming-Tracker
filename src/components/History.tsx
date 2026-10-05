import { describeSet, formatDateLong, formatDistance, formatDuration, formatMonth } from '../lib/format'
import { groupByMonth, sessionTotals } from '../lib/totals'
import type { Session } from '../lib/types'
import { EnergyBar } from './EnergyBar'

interface Props {
  sessions: Session[]
  onNew: () => void
  onOpen: (session: Session) => void
  onRepeat: (session: Session) => void
}

export function History({ sessions, onNew, onOpen, onRepeat }: Props) {
  const groups = groupByMonth(sessions)

  return (
    <section className="history">
      <div className="history-head">
        <h2>Sessions</h2>
        <button type="button" className="primary" onClick={onNew}>
          + New session
        </button>
      </div>

      {groups.length === 0 && (
        <p className="empty">No sessions yet. Log your first one to start your history.</p>
      )}

      {groups.map((g) => (
        <div key={g.month} className="month">
          <h3>
            {formatMonth(g.month)} <span className="muted">· {formatDistance(g.distance)}</span>
          </h3>
          <ul className="session-list">
            {g.sessions.map((s) => {
              const t = sessionTotals(s.sets)
              return (
                <li key={s.id} className="session-card">
                  <button type="button" className="session-open" onClick={() => onOpen(s)}>
                    <span className="session-date">{formatDateLong(s.date)}</span>
                    <span className="session-title">{s.title || 'Untitled session'}</span>
                    <span className="session-stats">
                      {formatDistance(t.distance)}
                      {t.time > 0 && ` · ${formatDuration(t.time)}${t.timeIsPartial ? '+' : ''}`}
                      {` · ${s.sets.length} set${s.sets.length === 1 ? '' : 's'}`}
                    </span>
                    <span className="session-sets">{s.sets.map(describeSet).join(' · ')}</span>
                    <EnergyBar byEnergy={t.byEnergy} total={t.distance} />
                  </button>
                  <button
                    type="button"
                    className="repeat"
                    title="Copy this session to today"
                    onClick={() => onRepeat(s)}
                  >
                    Repeat
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </section>
  )
}
