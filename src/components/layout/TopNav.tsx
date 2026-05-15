import { Link } from 'react-router-dom'
import { Wallet, Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { useSettingsStore } from '../../store'
import { CURRENCY_LIST } from '../../lib/currencies'
import { Button } from '../ui/Button'
import type { Theme } from '../../types'

export function TopNav() {
  const { theme, setTheme } = useTheme()
  const { settings, setDisplayCurrency } = useSettingsStore()
  const displayCurrency = settings.displayCurrency || settings.baseCurrency

  function cycleTheme() {
    const next: Theme = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system'
    setTheme(next)
  }

  return (
    <header className="hidden sm:flex items-center justify-between px-6 h-14 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-30">
      <Link to="/" className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold text-sm">
        <Wallet size={18} />
        <span>Finance</span>
      </Link>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5">
          <span className="text-xs text-gray-400 dark:text-gray-500">View in</span>
          <select
            value={displayCurrency}
            onChange={(e) => setDisplayCurrency(e.target.value)}
            className="text-xs font-semibold text-gray-900 dark:text-gray-100 bg-transparent border-none outline-none cursor-pointer"
            aria-label="Display currency"
          >
            {CURRENCY_LIST.map((c) => (
              <option key={c.code} value={c.code}>{c.code}</option>
            ))}
          </select>
        </div>

        <Button variant="ghost" size="icon" onClick={cycleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? (
            <Moon size={16} />
          ) : theme === 'light' ? (
            <Sun size={16} />
          ) : (
            <Monitor size={16} />
          )}
        </Button>
      </div>
    </header>
  )
}
