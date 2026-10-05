export const STROKES = [
  'free',
  'back',
  'breast',
  'fly',
  'IM',
  'choice',
  'kick',
  'pull',
  'drill',
] as const
export type Stroke = (typeof STROKES)[number]

export const ENERGY_SYSTEMS = [
  { code: 'REC', label: 'Recovery' },
  { code: 'A1', label: 'Aerobic 1 (easy)' },
  { code: 'A2', label: 'Aerobic 2 (steady)' },
  { code: 'AT', label: 'Threshold' },
  { code: 'VO2', label: 'VO2 max' },
  { code: 'LT', label: 'Lactate tolerance' },
  { code: 'SP', label: 'Sprint / speed' },
] as const
export type EnergySystem = (typeof ENERGY_SYSTEMS)[number]['code']

export interface SwimSet {
  id: string
  reps: number
  /** Metres per rep. */
  distance: number
  stroke: Stroke
  /** Send-off interval per rep, in seconds. Null when the set has no interval. */
  sendOff: number | null
  energy: EnergySystem
  note: string
}

export interface Session {
  id: string
  /** Local calendar date, YYYY-MM-DD. */
  date: string
  title: string
  notes: string
  sets: SwimSet[]
  createdAt: string
  updatedAt: string
}
