import { useState, type FormEvent } from 'react'
import { describeSet, formatDistance, formatDuration } from '../lib/format'
import { parseSet } from '../lib/parse'
import { newId } from '../lib/storage'
import { sessionTotals } from '../lib/totals'
import { ENERGY_SYSTEMS, type EnergySystem, type Session, type SwimSet } from '../lib/types'
import { EnergyBar } from './EnergyBar'
import { SetRow } from './SetRow'

interface Props {
  initial: Session
  isNew: boolean
  onSave: (session: Session) => void
  onCancel: () => void
  onDelete: (id: string) => void
}

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

  function save() {
    onSave({ ...session, updatedAt: new Date().toISOString() })
  }

  return (
    <section className="editor">
      <header className="editor-head">
        <h2>{isNew ? 'New session' : 'Edit session'}</h2>
        <div className="row">
          <label className="field">
            <span>Date</span>
            <input
              type="date"
              value={session.date}
              required
              onChange={(e) => e.target.value && setSession({ ...session, date: e.target.value })}
            />
          </label>
          <label className="field grow">
            <span>Title</span>
            <input
              value={session.title}
              placeholder="e.g. Tuesday threshold"
              onChange={(e) => setSession({ ...session, title: e.target.value })}
            />
          </label>
        </div>
      </header>

      <form className="quick-add" onSubmit={addQuick}>
        <label className="field grow">
          <span>Add a set</span>
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
        <label className="field">
          <span>Default energy</span>
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
        <button type="submit" className="primary">
          Add
        </button>
      </form>
      {quickError ? (
        <p className="error">{quickError}</p>
      ) : (
        <p className="hint">
          Type reps×distance, then any of: stroke (free, back, breast, fly, IM, kick, pull, drill,
          choice), @send-off, energy code ({ENERGY_SYSTEMS.map((e) => e.code).join(', ')}). Anything
          else becomes a note. Press Enter to add.
        </p>
      )}

      {session.sets.length === 0 ? (
        <p className="empty">No sets yet. Add your warm-up above.</p>
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
              onDuplicate={() =>
                setSets(session.sets.toSpliced(i + 1, 0, { ...set, id: newId() }))
              }
              onRemove={() => setSets(session.sets.filter((s) => s.id !== set.id))}
            />
          ))}
        </ol>
      )}

      <div className="totals">
        <div className="stat">
          <span className="stat-value">{formatDistance(totals.distance)}</span>
          <span className="stat-label">distance</span>
        </div>
        <div className="stat">
          <span className="stat-value">
            {formatDuration(totals.time)}
            {totals.timeIsPartial && totals.time > 0 ? '+' : ''}
          </span>
          <span className="stat-label">
            {totals.timeIsPartial ? 'time (sets with send-offs)' : 'time'}
          </span>
        </div>
        <div className="stat">
          <span className="stat-value">{session.sets.length}</span>
          <span className="stat-label">sets</span>
        </div>
        <EnergyBar byEnergy={totals.byEnergy} total={totals.distance} showLegend />
      </div>

      <label className="field">
        <span>Session notes</span>
        <textarea
          rows={3}
          value={session.notes}
          placeholder="How it felt, pool, anything to remember"
          onChange={(e) => setSession({ ...session, notes: e.target.value })}
        />
      </label>

      <footer className="editor-actions">
        {!isNew && (
          <button
            type="button"
            className="danger"
            onClick={() => {
              if (confirm('Delete this session?')) onDelete(session.id)
            }}
          >
            Delete
          </button>
        )}
        <span className="spacer" />
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="primary"
          disabled={session.sets.length === 0}
          title={session.sets.length === 0 ? 'Add at least one set' : undefined}
          onClick={save}
        >
          Save session
        </button>
      </footer>
      {session.sets.length > 0 && (
        <p className="hint summary">{session.sets.map(describeSet).join(' · ')}</p>
      )}
    </section>
  )
}
