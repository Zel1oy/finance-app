import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Settings, Theme, RateCache } from '../types'

const DEFAULT_SETTINGS: Settings = {
  baseCurrency: 'USD',
  theme: 'system',
  monthlyBudget: 2000,
  monthlyIncome: 0,
  categoryBudgets: {},
  rateCache: null,
}

interface SettingsState {
  settings: Settings
  setBaseCurrency: (code: string) => void
  setTheme: (theme: Theme) => void
  setMonthlyBudget: (amount: number) => void
  setMonthlyIncome: (amount: number) => void
  setCategoryBudgets: (budgets: Record<string, number>) => void
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
      setMonthlyIncome: (amount) =>
        set((state) => ({ settings: { ...state.settings, monthlyIncome: amount } })),
      setCategoryBudgets: (budgets) =>
        set((state) => ({ settings: { ...state.settings, categoryBudgets: budgets } })),
      updateRateCache: (cache) =>
        set((state) => ({ settings: { ...state.settings, rateCache: cache } })),
    }),
    {
      name: 'finance-app:settings',
      storage: createJSONStorage(() => localStorage),
      // Merge persisted state with defaults so new fields always exist
      merge: (persisted, current) => {
        const p = persisted as typeof current
        return {
          ...current,
          ...p,
          settings: {
            ...DEFAULT_SETTINGS,
            ...(p.settings ?? {}),
            // Guarantee new fields are never null/undefined
            monthlyIncome: p.settings?.monthlyIncome ?? 0,
            categoryBudgets: p.settings?.categoryBudgets ?? {},
          },
        }
      },
    },
  ),
)
