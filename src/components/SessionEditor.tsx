import { useState, type FormEvent } from 'react'
import { formatDistance, formatDuration, plural } from '../lib/format'
import { parseSet } from '../lib/parse'
import { newId } from '../lib/storage'
import { sessionTotals } from '../lib/totals'
import { ENERGY_SYSTEMS, type EnergySystem, type Session, type SwimSet } from '../lib/types'
import { EnergyStatList } from './EnergyBar'
import { EmptyState, Panel } from './Panel'
import { SetRow } from './SetRow'

interface Props {
  initial: Session
  isNew: boolean
  onSave: (session: Session) => void
  onCancel: () => void
  onDelete: (id: string) => void
}

const SHORTHAND_HINT = `Reps×distance first, then any of: stroke, @send-off, energy code (${ENERGY_SYSTEMS.map(
  (e) => e.code,
).join(', ')}). Anything else becomes a note.`

export function SessionEditor({ initial, isNew, onSave, onCancel, onDelete }: Props) {
  const [session, setSession] = useState(initial)
  const [quick, setQuick] = useState('')
  const [quickError, setQuickError] = useState('')
  const [defaultEnergy, setDefaultEnergy] = useState<EnergySystem>('A1')

  const totals = sessionTotals(session.sets)
  const setSets = (sets: SwimSet[]) => setSession((s) => ({ ...s, sets }))

  function addQuick(e: FormEvent) {
    e.preventDefault()
    if (!quick.trim()) return
    const parsed = parseSet(quick, defaultEnergy)
    if (!parsed) {
      setQuickError('Start with a distance, like "4x100 free @1:45 A2" or "400".')
      return
    }
    setSets([...session.sets, { id: newId(), ...parsed }])
    setQuick('')
    setQuickError('')
  }

  function move(i: number, delta: -1 | 1) {
    const sets = [...session.sets]
    ;[sets[i], sets[i + delta]] = [sets[i + delta], sets[i]]
    setSets(sets)
  }

  return (
    <div className="cr-stack">
      <div className="cr-grid">
        <Panel title="Session details" meta={<span className="cr-tag">{isNew ? 'New' : 'Saved'}</span>}>
          <div className="cr-fields-grid">
            <label className="cr-field">
              <span className="cr-field-label">Date</span>
              <input
                type="date"
                value={session.date}
                required
                onChange={(e) => e.target.value && setSession({ ...session, date: e.target.value })}
              />
            </label>
            <label className="cr-field prose">
              <span className="cr-field-label">Title</span>
              <input
                value={session.title}
                placeholder="e.g. Tuesday threshold"
                onChange={(e) => setSession({ ...session, title: e.target.value })}
              />
            </label>
            <label className="cr-field prose full">
              <span className="cr-field-label">Session notes</span>
              <textarea
                rows={3}
                value={session.notes}
                placeholder="How it felt, pool, anything to remember"
                onChange={(e) => setSession({ ...session, notes: e.target.value })}
              />
            </label>
          </div>
        </Panel>

        <Panel title="Totals" meta={<span className="cr-tag">{plural(session.sets.length, 'set')}</span>}>
          {session.sets.length === 0 ? (
            <EmptyState>Distance, time and the energy-system split will appear here as you add sets.</EmptyState>
          ) : (
            <>
              <div className="readouts">
                <div>
                  <span className="cr-field-label">Distance</span>
                  <span className="readout-value">{formatDistance(totals.distance)}</span>
                </div>
                <div>
                  <span className="cr-field-label">
                    {totals.timeIsPartial ? 'Time on send-offs' : 'Time'}
                  </span>
                  <span className="readout-value">
                    {formatDuration(totals.time)}
                    {totals.timeIsPartial && totals.time > 0 ? '+' : ''}
                  </span>
                </div>
              </div>
              <EnergyStatList byEnergy={totals.byEnergy} total={totals.distance} />
            </>
          )}
        </Panel>
      </div>

      <Panel title="Sets" meta={<span className="cr-tag">{formatDistance(totals.distance)}</span>}>
        <form className="quick-add" onSubmit={addQuick}>
          <label className="cr-field grow">
            <span className="cr-field-label">Add a set</span>
            <input
              autoFocus
              value={quick}
              placeholder="4x100 free @1:45 A2"
              onChange={(e) => {
                setQuick(e.target.value)
                setQuickError('')
              }}
            />
          </label>
          <label className="cr-field">
            <span className="cr-field-label">Default energy</span>
            <select
              value={defaultEnergy}
              onChange={(e) => setDefaultEnergy(e.target.value as EnergySystem)}
            >
              {ENERGY_SYSTEMS.map((e) => (
                <option key={e.code} value={e.code}>
                  {e.code}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="cr-btn">
            Add set
          </button>
        </form>
        <div className={`cr-status hint${quickError ? ' err' : ''}`}>{quickError || SHORTHAND_HINT}</div>

        {session.sets.length === 0 ? (
          <EmptyState>Sets will appear here once you add them. Start with your warm-up.</EmptyState>
        ) : (
          <ol className="set-list">
            {session.sets.map((set, i) => (
              <SetRow
                key={set.id}
                set={set}
                index={i}
                count={session.sets.length}
                onChange={(next) => setSets(session.sets.map((s) => (s.id === set.id ? next : s)))}
                onMove={(delta) => move(i, delta)}
                onDuplicate={() => setSets(session.sets.toSpliced(i + 1, 0, { ...set, id: newId() }))}
                onRemove={() => setSets(session.sets.filter((s) => s.id !== set.id))}
              />
            ))}
          </ol>
        )}

        <div className="cr-actions">
          <button
            type="button"
            className="cr-btn stamp"
            disabled={session.sets.length === 0}
            onClick={() => onSave({ ...session, updatedAt: new Date().toISOString() })}
          >
            Save session
          </button>
          <button type="button" className="cr-btn secondary" onClick={onCancel}>
            Cancel
          </button>
          <span className="spacer" />
          {!isNew && (
            <button
              type="button"
              className="cr-link-btn danger"
              onClick={() => {
                if (confirm('Delete this session?')) onDelete(session.id)
              }}
            >
              Delete session
            </button>
          )}
        </div>
        {session.sets.length === 0 && <div className="cr-status">Add at least one set to save.</div>}
      </Panel>
    </div>
  )
}
