// ---- Core domain types for MoneyManage ----

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category: string
  note: string
  date: string // ISO date string (yyyy-mm-dd)
  createdAt: number
}

export interface SalaryRecord {
  id: string
  source: string // employer / source name
  amount: number
  date: string // date received (yyyy-mm-dd)
  recurring: boolean // is this a recurring monthly salary
  note: string
  createdAt: number
}

export type DebtStatus = 'open' | 'settled'

/**
 * A Borrowing is money the user has borrowed FROM someone (the user owes it).
 * A Lending is money the user has lent TO someone (someone owes the user).
 * Both share the same shape and are stored separately.
 */
export interface DebtRecord {
  id: string
  person: string // counterparty name
  amount: number // original principal
  paid: number // amount repaid so far
  date: string // date created (yyyy-mm-dd)
  dueDate: string // optional due date (yyyy-mm-dd) or ''
  status: DebtStatus
  note: string
  createdAt: number
}

export type ThemeMode = 'light' | 'dark'

export interface Settings {
  currency: string // ISO code, e.g. "USD", "LKR", "EUR"
  locale: string // BCP 47 locale, e.g. "en-US"
  name: string // user's display name
  theme: ThemeMode
}

export interface AppData {
  transactions: Transaction[]
  salaries: SalaryRecord[]
  borrowings: DebtRecord[]
  lendings: DebtRecord[]
  settings: Settings
}
