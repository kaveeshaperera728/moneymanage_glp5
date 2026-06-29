import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { useData } from '../context/DataContext'
import StatCard from '../components/StatCard'
import { EmptyState } from '../components/ui'
import {
  IconWallet,
  IconTrendUp,
  IconTrendDown,
  IconBorrow,
  IconLend,
} from '../components/icons'
import { formatMoney, formatDate } from '../utils/format'
import {
  transactionTotals,
  netWorth,
  byCategory,
  monthlySeries,
  totalOutstanding,
  currentMonthTotals,
} from '../utils/calculations'

const PIE_COLORS = ['#6d5efc', '#22d3ee', '#f97316', '#10b981', '#f43f5e', '#a855f7', '#eab308', '#14b8a6']

export default function Dashboard() {
  const { data, settings } = useData()
  const fmt = (n: number) => formatMoney(n, settings)

  const totals = useMemo(() => transactionTotals(data.transactions), [data.transactions])
  const month = useMemo(() => currentMonthTotals(data.transactions), [data.transactions])
  const worth = useMemo(() => netWorth(data), [data])
  const series = useMemo(
    () => monthlySeries(data.transactions, 6, settings.locale),
    [data.transactions, settings.locale],
  )
  const expenseCats = useMemo(
    () => byCategory(data.transactions, 'expense').slice(0, 8),
    [data.transactions],
  )
  const youOwe = useMemo(() => totalOutstanding(data.borrowings), [data.borrowings])
  const owedToYou = useMemo(() => totalOutstanding(data.lendings), [data.lendings])

  const recent = useMemo(
    () =>
      [...data.transactions]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 6),
    [data.transactions],
  )

  const greeting = settings.name ? `Welcome back, ${settings.name}` : 'Welcome back'

  return (
    <div className="page">
      <div className="page-intro">
        <h2>{greeting} 👋</h2>
        <p className="muted">Here is your financial snapshot.</p>
      </div>

      <section className="stat-grid">
        <StatCard
          label="Net worth"
          value={fmt(worth)}
          tone="primary"
          icon={<IconWallet />}
          hint="Balance + lent − owed"
        />
        <StatCard
          label="Total income"
          value={fmt(totals.income)}
          tone="income"
          icon={<IconTrendUp />}
          hint={`This month ${fmt(month.income)}`}
        />
        <StatCard
          label="Total expenses"
          value={fmt(totals.expense)}
          tone="expense"
          icon={<IconTrendDown />}
          hint={`This month ${fmt(month.expense)}`}
        />
        <StatCard
          label="You owe"
          value={fmt(youOwe)}
          tone="warn"
          icon={<IconBorrow />}
          hint="Open borrowings"
        />
        <StatCard
          label="Owed to you"
          value={fmt(owedToYou)}
          tone="neutral"
          icon={<IconLend />}
          hint="Open lendings"
        />
      </section>

      <section className="grid-2">
        <div className="card">
          <div className="card-head">
            <h3>Income vs Expenses</h3>
            <span className="muted small">Last 6 months</span>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={series} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" vertical={false} />
                <XAxis dataKey="label" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} width={48} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    color: 'var(--text)',
                  }}
                  formatter={(v: number) => fmt(v)}
                />
                <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} fill="url(#gInc)" />
                <Area type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" strokeWidth={2} fill="url(#gExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Spending by category</h3>
            <span className="muted small">All time</span>
          </div>
          {expenseCats.length === 0 ? (
            <EmptyState title="No expenses yet" message="Add an expense to see the breakdown." />
          ) : (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={expenseCats}
                    dataKey="amount"
                    nameKey="category"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    stroke="var(--card)"
                    strokeWidth={2}
                  >
                    {expenseCats.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12, color: 'var(--muted)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      color: 'var(--text)',
                    }}
                    formatter={(v: number) => fmt(v)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <h3>Recent activity</h3>
          <Link to="/transactions" className="link">View all</Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            message="Start by adding your income and expenses."
            action={<Link to="/transactions" className="btn primary">Add transaction</Link>}
          />
        ) : (
          <ul className="tx-list">
            {recent.map((t) => (
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
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
