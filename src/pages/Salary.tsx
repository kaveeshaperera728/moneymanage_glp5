import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import Modal from '../components/Modal'
import StatCard from '../components/StatCard'
import { ConfirmDelete, EmptyState, Pill } from '../components/ui'
import { IconPlus, IconSalary } from '../components/icons'
import { formatMoney, formatDate, todayISO } from '../utils/format'

export default function Salary() {
  const { data, settings, addSalary, deleteSalary } = useData()
  const fmt = (n: number) => formatMoney(n, settings)

  const [open, setOpen] = useState(false)
  const [source, setSource] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayISO())
  const [recurring, setRecurring] = useState(true)
  const [note, setNote] = useState('')

  const list = useMemo(
    () => [...data.salaries].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [data.salaries],
  )

  const totalReceived = useMemo(() => data.salaries.reduce((s, r) => s + r.amount, 0), [data.salaries])
  const monthlyRecurring = useMemo(
    () => data.salaries.filter((r) => r.recurring).reduce((s, r) => s + r.amount, 0),
    [data.salaries],
  )

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return
    addSalary({ source: source.trim() || 'Salary', amount: amt, date, recurring, note: note.trim() })
    setSource(''); setAmount(''); setDate(todayISO()); setRecurring(true); setNote('')
    setOpen(false)
  }

  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <h2>Salary</h2>
          <p className="muted">Track your salary and recurring income. Each entry is also logged as income.</p>
        </div>
        <button className="btn primary" onClick={() => setOpen(true)}>
          <IconPlus /> Add salary
        </button>
      </div>

      <section className="stat-grid">
        <StatCard label="Recurring monthly" value={fmt(monthlyRecurring)} tone="primary" icon={<IconSalary />} hint="Marked recurring" />
        <StatCard label="Total recorded" value={fmt(totalReceived)} tone="income" icon={<IconSalary />} hint={`${data.salaries.length} entries`} />
      </section>

      <div className="card">
        {list.length === 0 ? (
          <EmptyState
            title="No salary records"
            message="Add your salary to keep your income organized."
            action={<button className="btn primary" onClick={() => setOpen(true)}>Add salary</button>}
          />
        ) : (
          <ul className="tx-list">
            {list.map((s) => (
              <li key={s.id} className="tx-row">
                <span className="tx-badge income"><IconSalary /></span>
                <div className="tx-main">
                  <span className="tx-cat">
                    {s.source} {s.recurring && <Pill tone="primary">Monthly</Pill>}
                  </span>
                  <span className="muted small">{s.note || '—'} · {formatDate(s.date, settings.locale)}</span>
                </div>
                <span className="tx-amount income">+{fmt(s.amount)}</span>
                <ConfirmDelete onConfirm={() => deleteSalary(s.id)} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={open} title="Add salary" onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="form">
          <label className="field">
            <span>Source / employer</span>
            <input type="text" placeholder="e.g. Acme Corp" value={source} onChange={(e) => setSource(e.target.value)} autoFocus />
          </label>
          <label className="field">
            <span>Amount</span>
            <input type="number" inputMode="decimal" step="0.01" min="0" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </label>
          <label className="field">
            <span>Date received</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label className="checkbox-field">
            <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
            <span>This is a recurring monthly salary</span>
          </label>
          <label className="field">
            <span>Note (optional)</span>
            <input type="text" placeholder="e.g. Base pay" value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <div className="form-actions">
            <button type="button" className="btn ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="btn primary">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
