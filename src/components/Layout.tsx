import { useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useData } from '../context/DataContext'
import {
  IconDashboard,
  IconTransactions,
  IconSalary,
  IconBorrow,
  IconLend,
  IconSettings,
  IconSun,
  IconMoon,
  IconMenu,
  IconClose,
} from './icons'

const nav = [
  { to: '/', label: 'Dashboard', icon: IconDashboard },
  { to: '/transactions', label: 'Transactions', icon: IconTransactions },
  { to: '/salary', label: 'Salary', icon: IconSalary },
  { to: '/borrowings', label: 'Borrowings', icon: IconBorrow },
  { to: '/lendings', label: 'Lendings', icon: IconLend },
  { to: '/settings', label: 'Settings', icon: IconSettings },
]

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/salary': 'Salary',
  '/borrowings': 'Borrowings',
  '/lendings': 'Lendings',
  '/settings': 'Settings',
}

export default function Layout({ children }: { children: ReactNode }) {
  const { settings, updateSettings } = useData()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const toggleTheme = () =>
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })

  const pageTitle = titles[location.pathname] ?? 'MoneyManage'

  return (
    <div className="app-shell">
      {/* Desktop sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">$</span>
          <span className="brand-name">MoneyManage</span>
        </div>
        <nav className="nav">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <p className="muted small">Data stays on this device.</p>
        </div>
      </aside>

      {/* Mobile slide-out drawer */}
      {drawerOpen && (
        <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <div className="brand">
                <span className="brand-mark">$</span>
                <span className="brand-name">MoneyManage</span>
              </div>
              <button className="icon-btn" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                <IconClose />
              </button>
            </div>
            <nav className="nav">
              {nav.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setDrawerOpen(false)}
                  className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
                >
                  <Icon />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}

      <div className="main">
        <header className="topbar">
          <button
            className="icon-btn only-mobile"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <IconMenu />
          </button>
          <h1 className="page-title">{pageTitle}</h1>
          <div className="topbar-actions">
            <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {settings.theme === 'dark' ? <IconSun /> : <IconMoon />}
            </button>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="bottom-nav">
        {nav.slice(0, 5).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => 'bottom-link' + (isActive ? ' active' : '')}
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
