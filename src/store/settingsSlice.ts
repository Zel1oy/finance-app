import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Settings, Theme, RateCache } from '../types'

const DEFAULT_SETTINGS: Settings = {
  baseCurrency: 'USD',
  theme: 'system',
  monthlyBudget: 2000,
  rateCache: null,
}

interface SettingsState {
  settings: Settings
  setBaseCurrency: (code: string) => void
  setTheme: (theme: Theme) => void
  setMonthlyBudget: (amount: number) => void
  updateRateCache: (cache: RateCache | null) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      setBaseCurrency: (code) =>
        set((state) => ({ settings: { ...state.settings, baseCurrency: code } })),
      setTheme: (theme) =>
        set((state) => ({ settings: { ...state.settings, theme } })),
      setMonthlyBudget: (amount) =>
        set((state) => ({ settings: { ...state.settings, monthlyBudget: amount } })),
      updateRateCache: (cache) =>
        set((state) => ({ settings: { ...state.settings, rateCache: cache } })),
    }),
    {
      name: 'finance-app:settings',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
