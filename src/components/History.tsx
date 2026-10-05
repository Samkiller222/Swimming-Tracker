import { describeSet, formatDateLong, formatDistance, formatDuration, formatMonth, plural } from '../lib/format'
import { groupByMonth, sessionTotals } from '../lib/totals'
import type { Session } from '../lib/types'
import { EnergyBar } from './EnergyBar'
import { EmptyState, Panel } from './Panel'

interface Props {
  sessions: Session[]
  onNew: () => void
  onOpen: (session: Session) => void
  onRepeat: (session: Session) => void
}

export function History({ sessions, onNew, onOpen, onRepeat }: Props) {
  const groups = groupByMonth(sessions)

  if (groups.length === 0) {
    return (
      <Panel title="Sessions" meta={<span className="cr-tag">0 sessions</span>}>
        <EmptyState>Your logged sessions will appear here, grouped by month.</EmptyState>
        <div className="cr-actions empty-actions">
          <button type="button" className="cr-btn stamp" onClick={onNew}>
            Log a session
          </button>
        </div>
      </Panel>
    )
  }

  return (
    <div className="cr-stack">
      <div className="toolbar">
        <span className="cr-status">{plural(sessions.length, 'session')} logged</span>
        <button type="button" className="cr-btn stamp" onClick={onNew}>
          New session
        </button>
      </div>
      {groups.map((g) => (
        <Panel
          key={g.month}
          title={formatMonth(g.month)}
          meta={
            <>
              <span className="cr-tag">{plural(g.sessions.length, 'session')}</span>
              <span className="cr-tag">{formatDistance(g.distance)}</span>
            </>
          }
          className="flush"
        >
          <div className="cr-table-wrap">
            <table className="cr-table history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Session</th>
                  <th>Distance</th>
                  <th>Time</th>
                  <th>Sets</th>
                  <th>Energy split</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {g.sessions.map((s) => {
                  const t = sessionTotals(s.sets)
                  return (
                    <tr key={s.id}>
                      <td className="date-cell">{formatDateLong(s.date)}</td>
                      <td className="session-cell">
                        <button type="button" className="session-title" onClick={() => onOpen(s)}>
                          {s.title || 'Untitled session'}
                        </button>
                        <span className="session-sets">{s.sets.map(describeSet).join(' · ')}</span>
                      </td>
                      <td data-label="Distance">{formatDistance(t.distance)}</td>
                      <td data-label="Time">
                        {t.time > 0 ? `${formatDuration(t.time)}${t.timeIsPartial ? '+' : ''}` : '—'}
                      </td>
                      <td data-label="Sets">{s.sets.length}</td>
                      <td className="energy-cell">
                        <EnergyBar byEnergy={t.byEnergy} total={t.distance} />
                      </td>
                      <td className="actions-cell">
                        <button type="button" className="cr-link-btn" onClick={() => onOpen(s)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="cr-link-btn"
                          title="Copy this session to today"
                          onClick={() => onRepeat(s)}
                        >
                          Repeat
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      ))}
    </div>
  )
}
