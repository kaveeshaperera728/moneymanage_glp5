import type { Settings } from '../types'

/** Format a number as a currency string using the user's settings. */
export function formatMoney(amount: number, settings: Settings): string {
  try {
    return new Intl.NumberFormat(settings.locale || 'en-US', {
      style: 'currency',
      currency: settings.currency || 'USD',
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    // Fallback if an invalid currency/locale is provided
    return `${settings.currency} ${amount.toFixed(2)}`
  }
}

/** Compact currency for tight spaces, e.g. $12.3K */
export function formatMoneyCompact(amount: number, settings: Settings): string {
  try {
    return new Intl.NumberFormat(settings.locale || 'en-US', {
      style: 'currency',
      currency: settings.currency || 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount)
  } catch {
    return formatMoney(amount, settings)
  }
}

/** Human friendly date, e.g. "29 Jun 2026" */
export function formatDate(iso: string, locale = 'en-US'): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Short month label, e.g. "Jun" */
export function monthLabel(iso: string, locale = 'en-US'): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString(locale, { month: 'short' })
}

/** Today's date as yyyy-mm-dd for input[type=date] defaults. */
export function todayISO(): string {
  const d = new Date()
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tz).toISOString().slice(0, 10)
}

/** Lightweight unique id generator. */
export function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  )
}
