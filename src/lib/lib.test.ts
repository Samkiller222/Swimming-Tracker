import { describe, expect, it } from 'vitest'
import { describeSet, formatDuration, parseDuration } from './format'
import { parseSet } from './parse'
import { createLocalStore } from './storage'
import { groupByMonth, sessionTotals } from './totals'
import type { Session, SwimSet } from './types'

function set(partial: Partial<SwimSet>): SwimSet {
  return {
    id: 'x',
    reps: 1,
    distance: 100,
    stroke: 'free',
    sendOff: null,
    energy: 'A1',
    note: '',
    ...partial,
  }
}

function session(partial: Partial<Session>): Session {
  return {
    id: 's',
    date: '2026-10-05',
    title: '',
    notes: '',
    sets: [],
    createdAt: '2026-10-05T10:00:00Z',
    updatedAt: '2026-10-05T10:00:00Z',
    ...partial,
  }
}

describe('durations', () => {
  it('parses common send-off formats', () => {
    expect(parseDuration('1:45')).toBe(105)
    expect(parseDuration('1.45')).toBe(105)
    expect(parseDuration('55')).toBe(55)
    expect(parseDuration('1:05:00')).toBe(3900)
    expect(parseDuration('1:75')).toBeNull()
    expect(parseDuration('abc')).toBeNull()
  })

  it('formats seconds', () => {
    expect(formatDuration(105)).toBe('1:45')
    expect(formatDuration(5)).toBe('0:05')
    expect(formatDuration(3900)).toBe('1:05:00')
  })
})

describe('parseSet', () => {
  it('reads the full shorthand', () => {
    expect(parseSet('4x100 free @1:45 A2')).toEqual({
      reps: 4,
      distance: 100,
      stroke: 'free',
      sendOff: 105,
      energy: 'A2',
      note: '',
    })
  })

  it('accepts aliases, any order, and a spaced @', () => {
    expect(parseSet('8×50 sp fly @ 1:00 hold race pace')).toMatchObject({
      reps: 8,
      distance: 50,
      stroke: 'fly',
      sendOff: 60,
      energy: 'SP',
      note: 'hold race pace',
    })
  })

  it('defaults reps, stroke and energy system', () => {
    expect(parseSet('400', 'REC')).toMatchObject({
      reps: 1,
      distance: 400,
      stroke: 'free',
      sendOff: null,
      energy: 'REC',
    })
  })

  it('rejects text without a distance', () => {
    expect(parseSet('')).toBeNull()
    expect(parseSet('free @1:45')).toBeNull()
    expect(parseSet('0x100')).toBeNull()
  })
})

describe('totals', () => {
  it('sums distance, time and energy split', () => {
    const t = sessionTotals([
      set({ reps: 4, distance: 100, sendOff: 105, energy: 'A2' }),
      set({ reps: 1, distance: 200, sendOff: null, energy: 'REC' }),
      set({ reps: 2, distance: 50, sendOff: 60, energy: 'A2' }),
    ])
    expect(t.distance).toBe(700)
    expect(t.time).toBe(4 * 105 + 2 * 60)
    expect(t.timeIsPartial).toBe(true)
    expect(t.byEnergy).toEqual({ A2: 500, REC: 200 })
  })

  it('describes a set', () => {
    expect(describeSet(set({ reps: 4, sendOff: 105 }))).toBe('4×100 free @ 1:45')
    expect(describeSet(set({ distance: 400, stroke: 'IM' }))).toBe('400 IM')
  })

  it('groups history by month, newest first', () => {
    const groups = groupByMonth([
      session({ id: 'a', date: '2026-09-30', sets: [set({ distance: 1000 })] }),
      session({ id: 'b', date: '2026-10-02', sets: [set({ distance: 500 })] }),
      session({ id: 'c', date: '2026-10-04', sets: [set({ distance: 300 })] }),
    ])
    expect(groups.map((g) => g.month)).toEqual(['2026-10', '2026-09'])
    expect(groups[0].sessions.map((s) => s.id)).toEqual(['c', 'b'])
    expect(groups[0].distance).toBe(800)
  })
})

describe('local store', () => {
  function memoryStorage(): Storage {
    const data = new Map<string, string>()
    return {
      get length() {
        return data.size
      },
      clear: () => data.clear(),
      getItem: (k) => data.get(k) ?? null,
      key: (i) => [...data.keys()][i] ?? null,
      removeItem: (k) => void data.delete(k),
      setItem: (k, v) => void data.set(k, v),
    }
  }

  it('saves, updates and removes sessions', () => {
    const store = createLocalStore(memoryStorage())
    store.save(session({ id: 'a', title: 'one' }))
    store.save(session({ id: 'b' }))
    store.save(session({ id: 'a', title: 'edited' }))
    expect(store.list().map((s) => [s.id, s.title])).toEqual([
      ['a', 'edited'],
      ['b', ''],
    ])
    store.remove('a')
    expect(store.list().map((s) => s.id)).toEqual(['b'])
  })

  it('survives corrupt storage', () => {
    const storage = memoryStorage()
    storage.setItem('swim-tracker:sessions:v1', '{not json')
    expect(createLocalStore(storage).list()).toEqual([])
  })
})
