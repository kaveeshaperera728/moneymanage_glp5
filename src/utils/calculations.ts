import type { AppData, DebtRecord, Transaction } from '../types'
import { monthLabel } from './format'

export interface Totals {
  income: number
  expense: number
  net: number // income - expense
  balance: number // net + salary received not double counted (see note)
}

/** Sum income and expenses across all transactions. */
export function transactionTotals(transactions: Transaction[]): Totals {
  let income = 0
  let expense = 0
  for (const t of transactions) {
    if (t.type === 'income') income += t.amount
    else expense += t.amount
  }
  return { income, expense, net: income - expense, balance: income - expense }
}

/** Outstanding amount remaining on a single debt record. */
export function outstanding(d: DebtRecord): number {
  return Math.max(0, d.amount - d.paid)
}

/** Total outstanding across a list of debts (only open ones contribute). */
export function totalOutstanding(records: DebtRecord[]): number {
  return records.reduce((sum, d) => sum + outstanding(d), 0)
}

/** Total of original principal across records. */
export function totalPrincipal(records: DebtRecord[]): number {
  return records.reduce((sum, d) => sum + d.amount, 0)
}

/**
 * Net worth estimate:
 *   transaction net (income - expense)
 *   + money owed to you (lendings outstanding)
 *   - money you owe (borrowings outstanding)
 */
export function netWorth(data: AppData): number {
  const tx = transactionTotals(data.transactions)
  const owedToYou = totalOutstanding(data.lendings)
  const youOwe = totalOutstanding(data.borrowings)
  return tx.net + owedToYou - youOwe
}

export interface CategoryTotal {
  category: string
  amount: number
}

/** Aggregate expense (or income) amounts by category, sorted desc. */
export function byCategory(
  transactions: Transaction[],
  type: 'income' | 'expense',
): CategoryTotal[] {
  const map = new Map<string, number>()
  for (const t of transactions) {
    if (t.type !== type) continue
    map.set(t.category, (map.get(t.category) ?? 0) + t.amount)
  }
  return Array.from(map.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
}

export interface MonthlyPoint {
  key: string // yyyy-mm
  label: string // e.g. "Jun"
  income: number
  expense: number
  net: number
}

/** Build a monthly income/expense series for the last `months` months. */
export function monthlySeries(
  transactions: Transaction[],
  months = 6,
  locale = 'en-US',
): MonthlyPoint[] {
  const now = new Date()
  const points: MonthlyPoint[] = []
  const index = new Map<string, MonthlyPoint>()

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const point: MonthlyPoint = {
      key,
      label: monthLabel(d.toISOString(), locale),
      income: 0,
      expense: 0,
      net: 0,
    }
    points.push(point)
    index.set(key, point)
  }

  for (const t of transactions) {
    const d = new Date(t.date)
    if (isNaN(d.getTime())) continue
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const point = index.get(key)
    if (!point) continue
    if (t.type === 'income') point.income += t.amount
    else point.expense += t.amount
    point.net = point.income - point.expense
  }

  return points
}

/** Totals limited to the current calendar month. */
export function currentMonthTotals(transactions: Transaction[]): Totals {
  const now = new Date()
  const inMonth = transactions.filter((t) => {
    const d = new Date(t.date)
    return (
      d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    )
  })
  return transactionTotals(inMonth)
}
