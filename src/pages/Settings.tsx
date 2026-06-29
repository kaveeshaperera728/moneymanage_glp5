import { useRef, useState } from 'react'
import { useData } from '../context/DataContext'

const CURRENCIES = [
  { code: 'USD', label: 'US Dollar ($)' },
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'GBP', label: 'British Pound (£)' },
  { code: 'LKR', label: 'Sri Lankan Rupee (Rs)' },
  { code: 'INR', label: 'Indian Rupee (₹)' },
  { code: 'AUD', label: 'Australian Dollar (A$)' },
  { code: 'CAD', label: 'Canadian Dollar (C$)' },
  { code: 'JPY', label: 'Japanese Yen (¥)' },
  { code: 'SGD', label: 'Singapore Dollar (S$)' },
  { code: 'AED', label: 'UAE Dirham (د.إ)' },
]

export default function Settings() {
  const { settings, updateSettings, resetAll, exportJSON, importJSON } = useData()
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const flash = (type: 'ok' | 'err', text: string) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3000)
  }

  const handleExport = () => {
    const blob = new Blob([exportJSON()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `moneymanage-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    flash('ok', 'Backup downloaded.')
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const ok = importJSON(String(reader.result))
      flash(ok ? 'ok' : 'err', ok ? 'Data imported successfully.' : 'Invalid backup file.')
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <h2>Settings</h2>
          <p className="muted">Personalize the app and manage your data.</p>
        </div>
      </div>

      {msg && <div className={`banner ${msg.type}`}>{msg.text}</div>}

      <div className="card">
        <h3 className="card-title">Profile</h3>
        <label className="field">
          <span>Your name</span>
          <input
            type="text"
            placeholder="Your name"
            value={settings.name}
            onChange={(e) => updateSettings({ name: e.target.value })}
          />
        </label>
      </div>

      <div className="card">
        <h3 className="card-title">Currency &amp; format</h3>
        <div className="field-row">
          <label className="field">
            <span>Currency</span>
            <select value={settings.currency} onChange={(e) => updateSettings({ currency: e.target.value })}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Locale</span>
            <select value={settings.locale} onChange={(e) => updateSettings({ locale: e.target.value })}>
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="en-IN">English (India)</option>
              <option value="si-LK">Sinhala (LK)</option>
              <option value="de-DE">German</option>
              <option value="fr-FR">French</option>
              <option value="ja-JP">Japanese</option>
            </select>
          </label>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Appearance</h3>
        <div className="theme-toggle-row">
          <button
            className={'theme-opt' + (settings.theme === 'light' ? ' active' : '')}
            onClick={() => updateSettings({ theme: 'light' })}
          >
            ☀️ Light
          </button>
          <button
            className={'theme-opt' + (settings.theme === 'dark' ? ' active' : '')}
            onClick={() => updateSettings({ theme: 'dark' })}
          >
            🌙 Dark
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Data management</h3>
        <p className="muted small">
          Your data is stored only in this browser. Export a backup to keep it safe or move it to another device.
        </p>
        <div className="btn-row">
          <button className="btn ghost" onClick={handleExport}>Export backup</button>
          <button className="btn ghost" onClick={() => fileRef.current?.click()}>Import backup</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={handleImport} />
        </div>
        <hr className="divider" />
        {confirmReset ? (
          <div className="btn-row">
            <span className="muted">Erase all data permanently?</span>
            <button className="btn danger" onClick={() => { resetAll(); setConfirmReset(false); flash('ok', 'All data cleared.') }}>
              Yes, erase everything
            </button>
            <button className="btn ghost" onClick={() => setConfirmReset(false)}>Cancel</button>
          </div>
        ) : (
          <button className="btn danger-outline" onClick={() => setConfirmReset(true)}>Reset all data</button>
        )}
      </div>

      <p className="muted small center">MoneyManage · your data never leaves your device.</p>
    </div>
  )
}
