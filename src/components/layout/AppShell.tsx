import { Navigate, Outlet } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../../hooks/useAuth'
import { TopNav } from './TopNav'
import { BottomNav } from './BottomNav'
import { SideNav } from './SideNav'

export function AppShell() {
  useTheme()
  const { user, loading } = useAuth()

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
        <main className="flex-1 px-4 pt-4 pb-24 sm:pb-8 sm:px-6 max-w-5xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
