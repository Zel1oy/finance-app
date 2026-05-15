import { useEffect, useRef } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../../hooks/useAuth'
import { useSettingsStore } from '../../store'
import { CURRENCY_LIST } from '../../lib/currencies'
import { processDueBills } from '../../lib/billUtils'
import { TopNav } from './TopNav'
import { BottomNav } from './BottomNav'
import { SideNav } from './SideNav'

export function AppShell() {
  useTheme()
  const { user, loading } = useAuth()
  const { settings, setDisplayCurrency } = useSettingsStore()
  const lastProcessed = useRef('')

  useEffect(() => {
    async function tryProcess() {
      const today = new Date().toISOString().slice(0, 10)
      if (!user || lastProcessed.current === today) return
      lastProcessed.current = today
      await processDueBills(useSettingsStore.getState().settings)
    }
    const onVisible = () => { if (document.visibilityState === 'visible') void tryProcess() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [user])
  const displayCurrency = settings.displayCurrency || settings.baseCurrency

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/auth" replace />

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-950 font-sans">
      <TopNav />
      <div className="flex">
        <SideNav />
        <main className="flex-1 px-4 pt-4 pb-24 sm:pb-10 sm:px-6 max-w-5xl mx-auto w-full">
          {/* Mobile-only currency selector */}
          <div className="sm:hidden flex justify-end mb-3">
            <div className="inline-flex items-center gap-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 shadow-sm">
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
          </div>
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
