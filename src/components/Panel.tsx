import type { ReactNode } from 'react'
import logo from '../assets/logo.png'

export function Panel({
  title,
  meta,
  children,
  className,
}: {
  title: string
  meta?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`cr-panel${className ? ` ${className}` : ''}`}>
      <div className="cr-panel-head">
        <h2>{title}</h2>
        {meta && <div className="cr-panel-meta">{meta}</div>}
      </div>
      <div className="cr-panel-body">{children}</div>
    </section>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="cr-empty">
      <img className="mark" src={logo} alt="" />
      {children}
    </div>
  )
}

