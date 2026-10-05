import { useEffect, useRef, useState } from 'react'
import logo from '../assets/logo.png'

export interface MenuItem {
  id: string
  label: string
  desc: string
}

interface Props {
  eyebrow: string
  title: string
  subtitle: string
  menu: MenuItem[]
  activeId: string
  onSelect: (id: string) => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function AppHeader({ eyebrow, title, subtitle, menu, activeId, onSelect, theme, onToggleTheme }: Props) {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  return (
    <header className="cr-header">
      <div className="cr-header-inner">
        <div className="cr-header-left">
          <div className="cr-menu-wrap" ref={wrap}>
            <button
              type="button"
              className="cr-round-btn"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            {open && (
              <div className="cr-app-menu">
                {menu.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={item.id === activeId ? 'active' : undefined}
                    onClick={() => {
                      setOpen(false)
                      onSelect(item.id)
                    }}
                  >
                    {item.label}
                    <span>{item.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <img className="cr-brand-logo" src={logo} alt="" />
          <div>
            <div className="cr-eyebrow">{eyebrow}</div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </div>
        <button
          type="button"
          className="cr-round-btn"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={onToggleTheme}
        >
          {theme === 'dark' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <line x1="12" y1="2" x2="12" y2="4" />
              <line x1="12" y1="20" x2="12" y2="22" />
              <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
              <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
              <line x1="2" y1="12" x2="4" y2="12" />
              <line x1="20" y1="12" x2="22" y2="12" />
              <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
              <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}
