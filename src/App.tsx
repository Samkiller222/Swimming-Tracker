import { useMemo, useState } from 'react'
import { History } from './components/History'
import { SessionEditor } from './components/SessionEditor'
import { todayISO } from './lib/format'
import { createLocalStore, newId } from './lib/storage'
import type { Session } from './lib/types'

type View = { kind: 'history' } | { kind: 'edit'; session: Session; isNew: boolean }

function blankSession(): Session {
  const now = new Date().toISOString()
  return { id: newId(), date: todayISO(), title: '', notes: '', sets: [], createdAt: now, updatedAt: now }
}

export default function App() {
  const store = useMemo(() => createLocalStore(), [])
  const [sessions, setSessions] = useState(() => store.list())
  const [view, setView] = useState<View>({ kind: 'history' })

  const refresh = () => setSessions(store.list())
  const goHome = () => setView({ kind: 'history' })

  return (
    <div className="app">
      <header className="app-head">
        <h1>
          <button type="button" className="brand" onClick={goHome}>
            🏊 Swim Log
          </button>
        </h1>
      </header>
      <main>
        {view.kind === 'history' ? (
          <History
            sessions={sessions}
            onNew={() => setView({ kind: 'edit', session: blankSession(), isNew: true })}
            onOpen={(session) => setView({ kind: 'edit', session, isNew: false })}
            onRepeat={(source) => {
              const copy = blankSession()
              setView({
                kind: 'edit',
                isNew: true,
                session: {
                  ...copy,
                  title: source.title,
                  sets: source.sets.map((s) => ({ ...s, id: newId() })),
                },
              })
            }}
          />
        ) : (
          <SessionEditor
            key={view.session.id}
            initial={view.session}
            isNew={view.isNew}
            onCancel={goHome}
            onSave={(session) => {
              store.save(session)
              refresh()
              goHome()
            }}
            onDelete={(id) => {
              store.remove(id)
              refresh()
              goHome()
            }}
          />
        )}
      </main>
    </div>
  )
}
