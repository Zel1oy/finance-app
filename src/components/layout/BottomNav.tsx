import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CreditCard,
  Repeat,
  PiggyBank,
  TrendingUp,
  Settings,
} from 'lucide-react'
import { cn } from '../../lib/utils'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Transactions', icon: CreditCard },
  { to: '/bills', label: 'Bills', icon: Repeat },
  { to: '/goals', label: 'Goals', icon: PiggyBank },
  { to: '/trends', label: 'Trends', icon: TrendingUp },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const

export function BottomNav() {
  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon, ...rest }) => (
          <NavLink
            key={to}
            to={to}
            {...('end' in rest ? { end: true } : {})}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-150 min-w-0',
                isActive
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300',
              )
            }
            aria-label={label}
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150',
                    isActive && 'bg-brand-50 dark:bg-brand-950',
                  )}
                >
                  <Icon size={18} />
                </span>
                <span className="text-[10px] font-medium truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
