import { parseDuration } from './format'
import { ENERGY_SYSTEMS, type EnergySystem, type Stroke, type SwimSet } from './types'

const STROKE_ALIASES: Record<string, Stroke> = {
  free: 'free',
  fr: 'free',
  freestyle: 'free',
  fs: 'free',
  back: 'back',
  bk: 'back',
  backstroke: 'back',
  breast: 'breast',
  br: 'breast',
  breaststroke: 'breast',
  fly: 'fly',
  fl: 'fly',
  butterfly: 'fly',
  im: 'IM',
  medley: 'IM',
  choice: 'choice',
  ch: 'choice',
  kick: 'kick',
  k: 'kick',
  pull: 'pull',
  pl: 'pull',
  drill: 'drill',
  dr: 'drill',
}

const ENERGY_CODES = new Map<string, EnergySystem>(
  ENERGY_SYSTEMS.map((e) => [e.code.toLowerCase(), e.code]),
)

export type ParsedSet = Omit<SwimSet, 'id'>

/**
 * Parses quick-entry shorthand such as "4x100 free @1:45 A2" or "200 kick ez".
 *
 * Order is flexible after the distance. Unrecognised words become the set's note.
 * Returns null when there is no distance.
 */
export function parseSet(text: string, defaultEnergy: EnergySystem = 'A1'): ParsedSet | null {
  const tokens = text
    .trim()
    // Allow "@ 1:45" as well as "@1:45".
    .replace(/@\s+/g, '@')
    .split(/\s+/)
    .filter(Boolean)
  if (tokens.length === 0) return null

  const head = tokens[0].toLowerCase().match(/^(?:(\d+)\s*[x×*])?(\d+)m?$/)
  if (!head) return null
  const reps = head[1] ? Number(head[1]) : 1
  const distance = Number(head[2])
  if (reps < 1 || distance < 1) return null

  let stroke: Stroke | null = null
  let sendOff: number | null = null
  let energy: EnergySystem | null = null
  const noteWords: string[] = []

  for (const token of tokens.slice(1)) {
    const lower = token.toLowerCase()
    if (lower.startsWith('@')) {
      const secs = parseDuration(lower.slice(1))
      if (secs !== null) {
        sendOff = secs
        continue
      }
    }
    if (!stroke && STROKE_ALIASES[lower]) {
      stroke = STROKE_ALIASES[lower]
      continue
    }
    if (!energy && ENERGY_CODES.has(lower)) {
      energy = ENERGY_CODES.get(lower)!
      continue
    }
    noteWords.push(token)
  }

  return {
    reps,
    distance,
    stroke: stroke ?? 'free',
    sendOff,
    energy: energy ?? defaultEnergy,
    note: noteWords.join(' '),
  }
}
