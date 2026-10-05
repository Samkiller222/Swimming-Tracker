import { useState } from 'react'
import { formatDuration, parseDuration } from '../lib/format'
import { setDistance } from '../lib/totals'
import { ENERGY_SYSTEMS, STROKES, type EnergySystem, type Stroke, type SwimSet } from '../lib/types'

interface Props {
  set: SwimSet
  index: number
  count: number
  onChange: (set: SwimSet) => void
  onMove: (delta: -1 | 1) => void
  onDuplicate: () => void
  onRemove: () => void
}

export function SetRow({ set, index, count, onChange, onMove, onDuplicate, onRemove }: Props) {
  const update = (patch: Partial<SwimSet>) => onChange({ ...set, ...patch })

  return (
    <li className={`set-row energy-${set.energy}`}>
      <div className="set-fields">
        <label className="field narrow">
          <span>Reps</span>
          <NumberInput value={set.reps} min={1} onChange={(reps) => update({ reps })} />
        </label>
        <span className="times">×</span>
        <label className="field narrow">
          <span>Metres</span>
          <NumberInput value={set.distance} min={1} onChange={(distance) => update({ distance })} />
        </label>
        <label className="field">
          <span>Stroke</span>
          <select value={set.stroke} onChange={(e) => update({ stroke: e.target.value as Stroke })}>
            {STROKES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="field narrow">
          <span>Send-off</span>
          <SendOffInput value={set.sendOff} onChange={(sendOff) => update({ sendOff })} />
        </label>
        <label className="field">
          <span>Energy</span>
          <select
            value={set.energy}
            onChange={(e) => update({ energy: e.target.value as EnergySystem })}
          >
            {ENERGY_SYSTEMS.map((e) => (
              <option key={e.code} value={e.code}>
                {e.code} · {e.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field grow">
          <span>Note</span>
          <input
            value={set.note}
            placeholder="e.g. descend 1–4"
            onChange={(e) => update({ note: e.target.value })}
          />
        </label>
      </div>
      <div className="set-actions">
        <span className="set-total">{setDistance(set)}m</span>
        <button type="button" className="icon" title="Move up" disabled={index === 0} onClick={() => onMove(-1)}>
          ↑
        </button>
        <button
          type="button"
          className="icon"
          title="Move down"
          disabled={index === count - 1}
          onClick={() => onMove(1)}
        >
          ↓
        </button>
        <button type="button" className="icon" title="Duplicate set" onClick={onDuplicate}>
          ⧉
        </button>
        <button type="button" className="icon danger" title="Remove set" onClick={onRemove}>
          ✕
        </button>
      </div>
    </li>
  )
}

function NumberInput({
  value,
  min,
  onChange,
}: {
  value: number
  min: number
  onChange: (n: number) => void
}) {
  const [text, setText] = useState(String(value))
  const [prev, setPrev] = useState(value)
  if (value !== prev) {
    setPrev(value)
    setText(String(value))
  }
  return (
    <input
      inputMode="numeric"
      value={text}
      onChange={(e) => {
        setText(e.target.value)
        const n = Number(e.target.value)
        if (Number.isInteger(n) && n >= min) onChange(n)
      }}
      onBlur={() => setText(String(value))}
    />
  )
}

/** Free-text m:ss input that only commits a value once it parses. Empty means no send-off. */
function SendOffInput({
  value,
  onChange,
}: {
  value: number | null
  onChange: (secs: number | null) => void
}) {
  const shown = value === null ? '' : formatDuration(value)
  const [text, setText] = useState(shown)
  const [prev, setPrev] = useState(value)
  if (value !== prev) {
    setPrev(value)
    setText(shown)
  }
  return (
    <input
      inputMode="decimal"
      placeholder="m:ss"
      value={text}
      onChange={(e) => {
        setText(e.target.value)
        if (e.target.value.trim() === '') onChange(null)
        else {
          const secs = parseDuration(e.target.value)
          if (secs !== null && secs > 0) onChange(secs)
        }
      }}
      onBlur={() => setText(shown)}
    />
  )
}
