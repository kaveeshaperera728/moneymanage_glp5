import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string
  icon?: ReactNode
  tone?: 'primary' | 'income' | 'expense' | 'neutral' | 'warn'
  hint?: string
}

export default function StatCard({ label, value, icon, tone = 'neutral', hint }: StatCardProps) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        {icon && <span className="stat-icon">{icon}</span>}
      </div>
      <div className="stat-value">{value}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  )
}
