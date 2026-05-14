import { Link } from 'react-router-dom'
import { Wallet, Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { Button } from '../ui/Button'
import type { Theme } from '../../types'

export function TopNav() {
  const { theme, setTheme } = useTheme()

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

      <Button variant="ghost" size="icon" onClick={cycleTheme} aria-label="Toggle theme">
        {theme === 'dark' ? (
          <Moon size={16} />
        ) : theme === 'light' ? (
          <Sun size={16} />
        ) : (
          <Monitor size={16} />
        )}
      </Button>
    </header>
  )
}
