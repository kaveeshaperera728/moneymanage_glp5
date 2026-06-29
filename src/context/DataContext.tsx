import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  AppData,
  DebtRecord,
  SalaryRecord,
  Settings,
  Transaction,
} from '../types'
import { uid } from '../utils/format'

const STORAGE_KEY = 'moneymanage.data.v1'

const defaultSettings: Settings = {
  currency: 'USD',
  locale: 'en-US',
  name: '',
  theme: 'dark',
}

const emptyData: AppData = {
  transactions: [],
  salaries: [],
  borrowings: [],
  lendings: [],
  settings: defaultSettings,
}

/** Provide a small set of example records on first run so the UI isn't empty. */
function seedData(): AppData {
  const now = Date.now()
  const d = new Date()
  const iso = (offsetDays: number) => {
    const x = new Date(d)
    x.setDate(x.getDate() - offsetDays)
    return x.toISOString().slice(0, 10)
  }
  return {
    settings: defaultSettings,
    salaries: [
      {
        id: uid(),
        source: 'Acme Corp',
        amount: 3200,
        date: iso(5),
        recurring: true,
        note: 'Monthly salary',
        createdAt: now,
      },
    ],
    transactions: [
      { id: uid(), type: 'income', amount: 3200, category: 'Salary', note: 'Monthly salary', date: iso(5), createdAt: now },
      { id: uid(), type: 'expense', amount: 950, category: 'Rent', note: 'Apartment', date: iso(4), createdAt: now },
      { id: uid(), type: 'expense', amount: 184.5, category: 'Groceries', note: 'Weekly shop', date: iso(3), createdAt: now },
      { id: uid(), type: 'expense', amount: 62, category: 'Transport', note: 'Fuel', date: iso(2), createdAt: now },
      { id: uid(), type: 'expense', amount: 45.99, category: 'Entertainment', note: 'Streaming + movie', date: iso(1), createdAt: now },
      { id: uid(), type: 'income', amount: 250, category: 'Freelance', note: 'Side project', date: iso(1), createdAt: now },
    ],
    borrowings: [
      {
        id: uid(),
        person: 'Alex',
        amount: 500,
        paid: 100,
        date: iso(20),
        dueDate: iso(-10),
        status: 'open',
        note: 'Emergency loan',
        createdAt: now,
      },
    ],
    lendings: [
      {
        id: uid(),
        person: 'Jordan',
        amount: 300,
        paid: 0,
        date: iso(15),
        dueDate: iso(-20),
        status: 'open',
        note: 'Lent for laptop',
        createdAt: now,
      },
    ],
  }
}

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedData()
    const parsed = JSON.parse(raw) as Partial<AppData>
    // Merge with defaults so older saves remain compatible.
    return {
      transactions: parsed.transactions ?? [],
      salaries: parsed.salaries ?? [],
      borrowings: parsed.borrowings ?? [],
      lendings: parsed.lendings ?? [],
      settings: { ...defaultSettings, ...(parsed.settings ?? {}) },
    }
  } catch {
    return emptyData
  }
}

type DebtKind = 'borrowings' | 'lendings'

interface DataContextValue {
  data: AppData
  settings: Settings
  // transactions
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void
  updateTransaction: (id: string, patch: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  // salaries
  addSalary: (s: Omit<SalaryRecord, 'id' | 'createdAt'>) => void
  updateSalary: (id: string, patch: Partial<SalaryRecord>) => void
  deleteSalary: (id: string) => void
  // debts (borrowings / lendings)
  addDebt: (kind: DebtKind, d: Omit<DebtRecord, 'id' | 'createdAt'>) => void
  updateDebt: (kind: DebtKind, id: string, patch: Partial<DebtRecord>) => void
  deleteDebt: (kind: DebtKind, id: string) => void
  recordRepayment: (kind: DebtKind, id: string, amount: number) => void
  // settings & data management
  updateSettings: (patch: Partial<Settings>) => void
  resetAll: () => void
  exportJSON: () => string
  importJSON: (raw: string) => boolean
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadData)

  // Persist on every change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      /* storage might be unavailable (private mode) — ignore */
    }
  }, [data])

  // Apply theme to <html data-theme>.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', data.settings.theme)
  }, [data.settings.theme])

  const addTransaction = useCallback((t: Omit<Transaction, 'id' | 'createdAt'>) => {
    setData((d) => ({
      ...d,
      transactions: [{ ...t, id: uid(), createdAt: Date.now() }, ...d.transactions],
    }))
  }, [])

  const updateTransaction = useCallback((id: string, patch: Partial<Transaction>) => {
    setData((d) => ({
      ...d,
      transactions: d.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }))
  }, [])

  const deleteTransaction = useCallback((id: string) => {
    setData((d) => ({ ...d, transactions: d.transactions.filter((t) => t.id !== id) }))
  }, [])

  const addSalary = useCallback((s: Omit<SalaryRecord, 'id' | 'createdAt'>) => {
    setData((d) => ({
      ...d,
      salaries: [{ ...s, id: uid(), createdAt: Date.now() }, ...d.salaries],
      // Also log salary as an income transaction for unified reporting.
      transactions: [
        {
          id: uid(),
          type: 'income' as const,
          amount: s.amount,
          category: 'Salary',
          note: s.source ? `Salary · ${s.source}` : 'Salary',
          date: s.date,
          createdAt: Date.now(),
        },
        ...d.transactions,
      ],
    }))
  }, [])

  const updateSalary = useCallback((id: string, patch: Partial<SalaryRecord>) => {
    setData((d) => ({
      ...d,
      salaries: d.salaries.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }))
  }, [])

  const deleteSalary = useCallback((id: string) => {
    setData((d) => ({ ...d, salaries: d.salaries.filter((s) => s.id !== id) }))
  }, [])

  const addDebt = useCallback((kind: DebtKind, rec: Omit<DebtRecord, 'id' | 'createdAt'>) => {
    setData((d) => ({
      ...d,
      [kind]: [{ ...rec, id: uid(), createdAt: Date.now() }, ...d[kind]],
    }))
  }, [])

  const updateDebt = useCallback((kind: DebtKind, id: string, patch: Partial<DebtRecord>) => {
    setData((d) => ({
      ...d,
      [kind]: d[kind].map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }))
  }, [])

  const deleteDebt = useCallback((kind: DebtKind, id: string) => {
    setData((d) => ({ ...d, [kind]: d[kind].filter((r) => r.id !== id) }))
  }, [])

  const recordRepayment = useCallback((kind: DebtKind, id: string, amount: number) => {
    setData((d) => ({
      ...d,
      [kind]: d[kind].map((r) => {
        if (r.id !== id) return r
        const paid = Math.min(r.amount, r.paid + amount)
        return { ...r, paid, status: paid >= r.amount ? 'settled' : 'open' }
      }),
    }))
  }, [])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }))
  }, [])

  const resetAll = useCallback(() => {
    setData({ ...emptyData, settings: defaultSettings })
  }, [])

  const exportJSON = useCallback(() => JSON.stringify(data, null, 2), [data])

  const importJSON = useCallback((raw: string): boolean => {
    try {
      const parsed = JSON.parse(raw) as Partial<AppData>
      setData({
        transactions: parsed.transactions ?? [],
        salaries: parsed.salaries ?? [],
        borrowings: parsed.borrowings ?? [],
        lendings: parsed.lendings ?? [],
        settings: { ...defaultSettings, ...(parsed.settings ?? {}) },
      })
      return true
    } catch {
      return false
    }
  }, [])

  const value = useMemo<DataContextValue>(
    () => ({
      data,
      settings: data.settings,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addSalary,
      updateSalary,
      deleteSalary,
      addDebt,
      updateDebt,
      deleteDebt,
      recordRepayment,
      updateSettings,
      resetAll,
      exportJSON,
      importJSON,
    }),
    [
      data,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addSalary,
      updateSalary,
      deleteSalary,
      addDebt,
      updateDebt,
      deleteDebt,
      recordRepayment,
      updateSettings,
      resetAll,
      exportJSON,
      importJSON,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within a DataProvider')
  return ctx
}
