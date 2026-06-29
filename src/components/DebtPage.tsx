import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import Modal from './Modal'
import StatCard from './StatCard'
import { ConfirmDelete, EmptyState, Pill, ProgressBar } from './ui'
import { IconPlus, IconCheck } from './icons'
import { formatMoney, formatDate, todayISO } from '../utils/format'
import { outstanding, totalOutstanding, totalPrincipal } from '../utils/calculations'
import type { DebtRecord } from '../types'

type Kind = 'borrowings' | 'lendings'

interface DebtPageProps {
  kind: Kind
  /** Copy strings tailored to borrowing vs lending. */
  copy: {
    title: string
    subtitle: string
    personLabel: string // e.g. "Lender" / "Borrower"
    outstandingLabel: string // e.g. "You owe" / "Owed to you"
    addLabel: string
    emptyMessage: string
    tone: 'warn' | 'neutral'
  }
}

export default function DebtPage({ kind, copy }: DebtPageProps) {
  const { data, settings, addDebt, deleteDebt, recordRepayment } = useData()
  const fmt = (n: number) => formatMoney(n, settings)
  const records = data[kind]

  const [open, setOpen] = useState(false)
  const [person, setPerson] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayISO())
  const [dueDate, setDueDate] = useState('')
  const [note, setNote] = useState('')

  // repayment modal
  const [payTarget, setPayTarget] = useState<DebtRecord | null>(null)
  const [payAmount, setPayAmount] = useState('')

  const list = useMemo(
    () =>
      [...records].sort((a, b) => {
        // open first, then by date desc
        if (a.status !== b.status) return a.status === 'open' ? -1 : 1
        return a.date < b.date ? 1 : -1
      }),
    [records],
  )

  const open$ = useMemo(() => totalOutstanding(records), [records])
  const principal$ = useMemo(() => totalPrincipal(records), [records])
  const settled$ = principal$ - records.reduce((s, r) => s + outstanding(r), 0)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (!amt || amt <= 0 || !person.trim()) return
    addDebt(kind, {
      person: person.trim(),
      amount: amt,
      paid: 0,
      date,
      dueDate,
      status: 'open',
      note: note.trim(),
    })
    setPerson(''); setAmount(''); setDate(todayISO()); setDueDate(''); setNote('')
    setOpen(false)
  }

  const submitPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!payTarget) return
    const amt = parseFloat(payAmount)
    if (!amt || amt <= 0) return
    recordRepayment(kind, payTarget.id, amt)
    setPayTarget(null)
    setPayAmount('')
  }

  const isOverdue = (r: DebtRecord) =>
    r.status === 'open' && r.dueDate && new Date(r.dueDate) < new Date(todayISO())

  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <h2>{copy.title}</h2>
          <p className="muted">{copy.subtitle}</p>
        </div>
        <button className="btn primary" onClick={() => setOpen(true)}>
          <IconPlus /> {copy.addLabel}
        </button>
      </div>

      <section className="stat-grid">
        <StatCard label={copy.outstandingLabel} value={fmt(open$)} tone={copy.tone} hint="Remaining balance" />
        <StatCard label="Total principal" value={fmt(principal$)} tone="neutral" hint={`${records.length} records`} />
        <StatCard label="Settled" value={fmt(settled$)} tone="income" hint="Already cleared" />
      </section>

      <div className="card">
        {list.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            message={copy.emptyMessage}
            action={<button className="btn primary" onClick={() => setOpen(true)}>{copy.addLabel}</button>}
          />
        ) : (
          <ul className="debt-list">
            {list.map((r) => {
              const out = outstanding(r)
              const progress = r.amount > 0 ? r.paid / r.amount : 0
              return (
                <li key={r.id} className={'debt-card' + (r.status === 'settled' ? ' settled' : '')}>
                  <div className="debt-top">
                    <div className="debt-person">
                      <span className="avatar">{r.person.slice(0, 1).toUpperCase()}</span>
                      <div>
                        <div className="debt-name">
                          {r.person}
                          {r.status === 'settled' && <Pill tone="income">Settled</Pill>}
                          {isOverdue(r) && <Pill tone="warn">Overdue</Pill>}
                        </div>
                        <span className="muted small">
                          {copy.personLabel} · {formatDate(r.date, settings.locale)}
                          {r.dueDate ? ` · due ${formatDate(r.dueDate, settings.locale)}` : ''}
                        </span>
                      </div>
                    </div>
                    <ConfirmDelete onConfirm={() => deleteDebt(kind, r.id)} />
                  </div>

                  {r.note && <p className="debt-note muted small">{r.note}</p>}

                  <div className="debt-amounts">
                    <div>
                      <span className="muted small">Outstanding</span>
                      <strong className={out > 0 ? 'amount-warn' : 'amount-ok'}>{fmt(out)}</strong>
                    </div>
                    <div className="ta-right">
                      <span className="muted small">Paid {fmt(r.paid)} of {fmt(r.amount)}</span>
                    </div>
                  </div>

                  <ProgressBar value={progress} tone={r.status === 'settled' ? 'income' : 'primary'} />

                  {r.status === 'open' && (
                    <div className="debt-actions">
                      <button
                        className="btn ghost sm"
                        onClick={() => { setPayTarget(r); setPayAmount('') }}
                      >
                        Record payment
                      </button>
                      <button
                        className="btn primary sm"
                        onClick={() => recordRepayment(kind, r.id, out)}
                      >
                        <IconCheck /> Settle all
                      </button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Add record modal */}
      <Modal open={open} title={copy.addLabel} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="form">
          <label className="field">
            <span>{copy.personLabel}</span>
            <input type="text" placeholder="Name" value={person} onChange={(e) => setPerson(e.target.value)} autoFocus required />
          </label>
          <label className="field">
            <span>Amount</span>
            <input type="number" inputMode="decimal" step="0.01" min="0" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </label>
          <div className="field-row">
            <label className="field">
              <span>Date</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </label>
            <label className="field">
              <span>Due date (optional)</span>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </label>
          </div>
          <label className="field">
            <span>Note (optional)</span>
            <input type="text" placeholder="What is this for?" value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <div className="form-actions">
            <button type="button" className="btn ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="btn primary">Save</button>
          </div>
        </form>
      </Modal>

      {/* Repayment modal */}
      <Modal open={!!payTarget} title="Record payment" onClose={() => setPayTarget(null)}>
        {payTarget && (
          <form onSubmit={submitPayment} className="form">
            <p className="muted">
              {payTarget.person} · Outstanding {fmt(outstanding(payTarget))}
            </p>
            <label className="field">
              <span>Payment amount</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                max={outstanding(payTarget)}
                placeholder="0.00"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                autoFocus
                required
              />
            </label>
            <div className="form-actions">
              <button type="button" className="btn ghost" onClick={() => setPayTarget(null)}>Cancel</button>
              <button type="submit" className="btn primary">Record</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
