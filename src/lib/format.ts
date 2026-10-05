import type { SwimSet } from './types'

/** Formats seconds as m:ss, or h:mm:ss once past an hour. */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = String(s % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`
}

/** Parses "1:45", "1.45", "105" or "0:55" into seconds. Returns null if unparseable. */
export function parseDuration(text: string): number | null {
  const t = text.trim()
  if (!t) return null
  const parts = t.split(/[:.]/)
  if (parts.some((p) => !/^\d+$/.test(p))) return null
  if (parts.length === 1) return Number(parts[0])
  if (parts.length === 2) {
    const [m, s] = parts.map(Number)
    return s < 60 ? m * 60 + s : null
  }
  if (parts.length === 3) {
    const [h, m, s] = parts.map(Number)
    return m < 60 && s < 60 ? h * 3600 + m * 60 + s : null
  }
  return null
}

export function formatDistance(metres: number): string {
  return `${metres.toLocaleString('en-GB')}m`
}

/** Renders a set the way a coach would write it on a whiteboard: "4×100 free @ 1:45". */
export function describeSet(set: SwimSet): string {
  const reps = set.reps > 1 ? `${set.reps}×` : ''
  const sendOff = set.sendOff ? ` @ ${formatDuration(set.sendOff)}` : ''
  return `${reps}${set.distance} ${set.stroke}${sendOff}`
}

/** Today's local date as YYYY-MM-DD. */
export function todayISO(now = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatDateLong(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatMonth(iso: string): string {
  const [y, m] = iso.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

/** "1 set", "3 sets". */
export function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}
