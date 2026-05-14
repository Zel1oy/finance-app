import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CreditCard,
  Repeat,
  PiggyBank,
  TrendingUp,
  Settings,
  Wallet,
  Moon,
  Sun,
  Monitor,
  LogOut,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'
import type { Theme } from '../../types'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Transactions', icon: CreditCard },
  { to: '/bills', label: 'Recurring Bills', icon: Repeat },
  { to: '/goals', label: 'Goals', icon: PiggyBank },
  { to: '/trends', label: 'Trends', icon: TrendingUp },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const

export function SideNav() {
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()

  function cycleTheme() {
    const next: Theme = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system'
    setTheme(next)
  }

  return (
    <aside className="hidden sm:flex flex-col w-56 min-h-[calc(100dvh-3.5rem)] border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-4 sticky top-14 self-start shrink-0">
      <div className="flex items-center gap-2 px-3 mb-6">
        <Wallet size={16} className="text-brand-500" />
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          Navigation
        </span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, ...rest }) => (
          <NavLink
            key={to}
            to={to}
            {...('end' in rest ? { end: true } : {})}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-1">
        <Button variant="ghost" size="sm" onClick={cycleTheme} className="w-full justify-start gap-3">
          {theme === 'dark' ? (
            <><Moon size={15} /> Dark mode</>
          ) : theme === 'light' ? (
            <><Sun size={15} /> Light mode</>
          ) : (
            <><Monitor size={15} /> System</>
          )}
        </Button>
        {user && (
          <>
            <p className="px-3 py-1 text-xs text-gray-400 dark:text-gray-500 truncate">
              {user.email}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void signOut()}
              className="w-full justify-start gap-3 text-gray-500 dark:text-gray-400"
            >
              <LogOut size={15} />
              Sign out
            </Button>
          </>
        )}
      </div>
    </aside>
  )
}
