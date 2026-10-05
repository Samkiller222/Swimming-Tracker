import type { Session } from './types'

/**
 * Where sessions are kept. Phase 1 uses the browser's localStorage; a Supabase
 * implementation can replace this later without the UI changing.
 */
export interface SessionStore {
  list(): Session[]
  save(session: Session): void
  remove(id: string): void
}

const KEY = 'swim-tracker:sessions:v1'

export function createLocalStore(storage: Storage = window.localStorage): SessionStore {
  function readAll(): Session[] {
    try {
      const raw = storage.getItem(KEY)
      const parsed: unknown = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? (parsed as Session[]) : []
    } catch {
      return []
    }
  }

  function writeAll(sessions: Session[]) {
    storage.setItem(KEY, JSON.stringify(sessions))
  }

  return {
    list: readAll,
    save(session) {
      const all = readAll()
      const i = all.findIndex((s) => s.id === session.id)
      if (i >= 0) all[i] = session
      else all.push(session)
      writeAll(all)
    },
    remove(id) {
      writeAll(readAll().filter((s) => s.id !== id))
    },
  }
}

export function newId(): string {
  return crypto.randomUUID()
}
