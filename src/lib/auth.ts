import { supabase } from './supabase'
import { useAuthStore } from '../store/authSlice'
import { useTransactionsStore } from '../store/transactionsSlice'
import { useBillsStore } from '../store/billsSlice'
import { useGoalsStore } from '../store/goalsSlice'
import { useSettingsStore } from '../store/settingsSlice'
import { useCategoriesStore } from '../store/categoriesSlice'
import {
  fetchTransactions, fetchBills, fetchGoals,
  fetchSettings, upsertSettings, fetchCategories,
} from './db'
import { processDueBills } from './billUtils'
import { seedDemoData } from './storage'
import type { Theme } from '../types'

let dataLoading = false

async function loadUserData(userId: string) {
  if (dataLoading) return
  dataLoading = true
  try {
    const [transactions, bills, goals, settings, categories] = await Promise.all([
      fetchTransactions(userId),
      fetchBills(userId),
      fetchGoals(userId),
      fetchSettings(userId),
      fetchCategories(userId),
    ])

    useTransactionsStore.getState().setTransactions(transactions)
    useBillsStore.getState().setBills(bills)
    useGoalsStore.getState().setGoals(goals)
    useCategoriesStore.getState().setCustomCategories(categories)

    if (settings) {
      const store = useSettingsStore.getState()
      store.setBaseCurrency(settings.baseCurrency)
      store.setTheme(settings.theme as Theme)
      store.setMonthlyBudget(settings.monthlyBudget)
      store.setMonthlyIncome(settings.monthlyIncome)
      store.setCategoryBudgets(settings.categoryBudgets)
      store.setMonobankToken(settings.monobankToken)
    } else {
      const s = useSettingsStore.getState().settings
      await upsertSettings(userId, {
        baseCurrency: s.baseCurrency,
        theme: s.theme,
        monthlyBudget: s.monthlyBudget,
        monthlyIncome: s.monthlyIncome,
        categoryBudgets: s.categoryBudgets,
        monobankToken: s.monobankToken,
      })
    }

    if (transactions.length === 0 && bills.length === 0 && goals.length === 0) {
      await seedDemoData(userId)
    }

    // Auto-create transactions for any overdue bills
    await processDueBills(useSettingsStore.getState().settings)
  } finally {
    dataLoading = false
  }
}

function clearUserData() {
  useTransactionsStore.getState().setTransactions([])
  useBillsStore.getState().setBills([])
  useGoalsStore.getState().setGoals([])
}

export async function signOut() {
  await supabase.auth.signOut()
}

export function initAuth() {
  const { setUser, setLoading } = useAuthStore.getState()

  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null)
    if (session?.user) {
      loadUserData(session.user.id).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  })

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    const newUser = session?.user ?? null
    setUser(newUser)
    if (newUser) {
      setLoading(true)
      loadUserData(newUser.id).finally(() => setLoading(false))
    } else {
      clearUserData()
      setLoading(false)
    }
  })

  return () => subscription.unsubscribe()
}
