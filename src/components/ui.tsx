import { useState, type ReactNode } from 'react'
import { IconTrash } from './icons'

/** Empty placeholder for lists with no records. */
export function EmptyState({
  title,
  message,
  action,
}: {
  title: string
  message: string
  action?: ReactNode
}) {
  return (
    <div className="empty-state">
      <div className="empty-emoji" aria-hidden>🗂️</div>
      <h3>{title}</h3>
      <p className="muted">{message}</p>
      {action}
    </div>
  )
}

/** A horizontal progress bar showing fraction complete (0..1). */
export function ProgressBar({ value, tone = 'primary' }: { value: number; tone?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)))
  return (
    <div className="progress" aria-label={`${pct}% complete`}>
      <div className={`progress-fill tone-${tone}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

/** Small status pill. */
export function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: string }) {
  return <span className={`pill pill-${tone}`}>{children}</span>
}

/**
 * A delete button that requires a second click to confirm, avoiding the need
 * for a separate confirm dialog while still preventing accidental deletes.
 */
export function ConfirmDelete({ onConfirm, label = 'Delete' }: { onConfirm: () => void; label?: string }) {
  const [armed, setArmed] = useState(false)
  return (
    <button
      className={'icon-btn danger' + (armed ? ' armed' : '')}
      title={armed ? 'Click again to confirm' : label}
      onClick={(e) => {
        e.stopPropagation()
        if (armed) onConfirm()
        else {
          setArmed(true)
          setTimeout(() => setArmed(false), 2500)
        }
      }}
    >
      <IconTrash />
    </button>
  )
}
