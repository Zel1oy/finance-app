import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { useAuthStore } from '../../store'
import { upsertSettings } from '../../lib/db'
import { cn } from '../../lib/utils'
import type { Theme } from '../../types'

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { user } = useAuthStore()

  function handleSetTheme(value: Theme) {
    setTheme(value)
    if (user) void upsertSettings(user.id, { theme: value })
  }

  return (
    <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => handleSetTheme(value)}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-all',
            theme === value
              ? 'bg-brand-500 text-white'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
          )}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  )
}
