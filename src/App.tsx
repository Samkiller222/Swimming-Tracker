import { useEffect, useMemo, useState } from 'react'
import { AppHeader, type MenuItem } from './components/AppHeader'
import { History } from './components/History'
import { SessionEditor } from './components/SessionEditor'
import { todayISO } from './lib/format'
import { createLocalStore, newId } from './lib/storage'
import { applyTheme, initialTheme } from './lib/theme'
import type { Session } from './lib/types'

type View = { kind: 'history' } | { kind: 'edit'; session: Session; isNew: boolean }

const MENU: MenuItem[] = [
  { id: 'history', label: 'Sessions', desc: 'Browse your logged sessions' },
  { id: 'new', label: 'New session', desc: 'Log a session from sets' },
]

function blankSession(): Session {
  const now = new Date().toISOString()
  return { id: newId(), date: todayISO(), title: '', notes: '', sets: [], createdAt: now, updatedAt: now }
}

function headerFor(view: View) {
  if (view.kind === 'history') {
    return {
      eyebrow: 'Swim Log · Sessions',
      title: 'Session history',
      subtitle: 'Every session you have logged, grouped by month. Open one to edit it, or repeat it onto today.',
    }
  }
  return {
    eyebrow: 'Swim Log · Session logger',
    title: view.isNew ? 'New session' : 'Edit session',
    subtitle: 'Build the session from sets. Type shorthand like 4x100 free @1:45 A2 and press Enter.',
  }
}

export default function App() {
  const store = useMemo(() => createLocalStore(), [])
  const [sessions, setSessions] = useState(() => store.list())
  const [view, setView] = useState<View>({ kind: 'history' })
  const [theme, setTheme] = useState(initialTheme)

  useEffect(() => applyTheme(theme), [theme])

  const refresh = () => setSessions(store.list())
  const goHome = () => setView({ kind: 'history' })
  const startNew = () => setView({ kind: 'edit', session: blankSession(), isNew: true })

  const activeMenu = view.kind === 'history' ? 'history' : view.isNew ? 'new' : ''

  return (
    <div className="app">
      <AppHeader
        {...headerFor(view)}
        menu={MENU}
        activeId={activeMenu}
        onSelect={(id) => (id === 'new' ? startNew() : goHome())}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />
      <main className="cr-main">
        {view.kind === 'history' ? (
          <History
            sessions={sessions}
            onNew={startNew}
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
      <footer className="cr-footer">Sessions are saved in this browser only. Nothing is sent anywhere.</footer>
    </div>
  )
}
