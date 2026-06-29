import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import Modal from '../components/Modal'
import { ConfirmDelete, EmptyState, Pill } from '../components/ui'
import { IconPlus, IconTrendUp, IconTrendDown } from '../components/icons'
import { formatMoney, formatDate, todayISO } from '../utils/format'
import { transactionTotals } from '../utils/calculations'
import type { TransactionType } from '../types'

const INCOME_CATS = ['Salary', 'Freelance', 'Business', 'Gift', 'Investment', 'Refund', 'Other']
const EXPENSE_CATS = [
  'Rent', 'Groceries', 'Transport', 'Utilities', 'Dining', 'Entertainment',
  'Health', 'Shopping', 'Education', 'Travel', 'Subscriptions', 'Other',
]

type Filter = 'all' | TransactionType

export default function Transactions() {
  const { data, settings, addTransaction, deleteTransaction } = useData()
  const fmt = (n: number) => formatMoney(n, settings)

  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')

  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Groceries')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayISO())

  const totals = useMemo(() => transactionTotals(data.transactions), [data.transactions])

  const list = useMemo(() => {
    const filtered = filter === 'all' ? data.transactions : data.transactions.filter((t) => t.type === filter)
    return [...filtered].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt))
  }, [data.transactions, filter])

  const cats = type === 'income' ? INCOME_CATS : EXPENSE_CATS

  const resetForm = () => {
    setType('expense')
    setAmount('')
    setCategory('Groceries')
    setNote('')
    setDate(todayISO())
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return
    addTransaction({ type, amount: amt, category, note: note.trim(), date })
    resetForm()
    setOpen(false)
  }

  const openFor = (t: TransactionType) => {
    resetForm()
    setType(t)
    setCategory(t === 'income' ? 'Salary' : 'Groceries')
    setOpen(true)
  }

  return (
    <div className="page">
      <div className="toolbar">
        <div className="segmented">
          {(['all', 'income', 'expense'] as Filter[]).map((f) => (
            <button
              key={f}
              className={'seg' + (filter === f ? ' active' : '')}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'income' ? 'Income' : 'Expenses'}
            </button>
          ))}
        </div>
        <div className="toolbar-actions">
          <button className="btn ghost income" onClick={() => openFor('income')}>
            <IconPlus /> Income
          </button>
          <button className="btn primary" onClick={() => openFor('expense')}>
            <IconPlus /> Expense
          </button>
        </div>
      </div>

      <div className="summary-row">
        <Pill tone="income">Income {fmt(totals.income)}</Pill>
        <Pill tone="expense">Expenses {fmt(totals.expense)}</Pill>
        <Pill tone={totals.net >= 0 ? 'primary' : 'warn'}>Net {fmt(totals.net)}</Pill>
      </div>

      <div className="card">
        {list.length === 0 ? (
          <EmptyState
            title="No transactions"
            message="Add your first income or expense to get started."
            action={<button className="btn primary" onClick={() => openFor('expense')}>Add transaction</button>}
          />
        ) : (
          <ul className="tx-list">
            {list.map((t) => (
              <li key={t.id} className="tx-row">
                <span className={`tx-badge ${t.type}`}>
                  {t.type === 'income' ? <IconTrendUp /> : <IconTrendDown />}
                </span>
                <div className="tx-main">
                  <span className="tx-cat">{t.category}</span>
                  <span className="muted small">{t.note || '—'} · {formatDate(t.date, settings.locale)}</span>
                </div>
                <span className={`tx-amount ${t.type}`}>
                  {t.type === 'income' ? '+' : '−'}{fmt(t.amount)}
                </span>
                <ConfirmDelete onConfirm={() => deleteTransaction(t.id)} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={open} title={type === 'income' ? 'Add income' : 'Add expense'} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="form">
          <div className="type-toggle">
            <button
              type="button"
              className={'type-opt income' + (type === 'income' ? ' active' : '')}
              onClick={() => { setType('income'); setCategory('Salary') }}
            >
              Income
            </button>
            <button
              type="button"
              className={'type-opt expense' + (type === 'expense' ? ' active' : '')}
              onClick={() => { setType('expense'); setCategory('Groceries') }}
            >
              Expense
            </button>
          </div>

          <label className="field">
            <span>Amount</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              required
            />
          </label>

          <label className="field">
            <span>Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {cats.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <label className="field">
            <span>Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>

          <label className="field">
            <span>Note (optional)</span>
            <input type="text" placeholder="e.g. Weekly grocery shop" value={note} onChange={(e) => setNote(e.target.value)} />
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
