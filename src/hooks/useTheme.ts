import { useEffect } from 'react'
import { useSettingsStore } from '../store'

export function useTheme() {
  const { settings, setTheme } = useSettingsStore()

  useEffect(() => {
    const root = document.documentElement
    const { theme } = settings

    function applyTheme(isDark: boolean) {
      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    if (theme === 'dark') {
      applyTheme(true)
    } else if (theme === 'light') {
      applyTheme(false)
    } else {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      applyTheme(mq.matches)
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches)
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [settings.theme])

  return { theme: settings.theme, setTheme }
}
