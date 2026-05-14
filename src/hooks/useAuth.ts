import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authSlice'
import { useTransactionsStore } from '../store/transactionsSlice'
import { useBillsStore } from '../store/billsSlice'
import { useGoalsStore } from '../store/goalsSlice'
import { useSettingsStore } from '../store/settingsSlice'
import { fetchTransactions, fetchBills, fetchGoals, fetchSettings, upsertSettings } from '../lib/db'
import { seedDemoData } from '../lib/storage'
import type { Theme } from '../types'

async function loadUserData(userId: string) {
  const [transactions, bills, goals, settings] = await Promise.all([
    fetchTransactions(userId),
    fetchBills(userId),
    fetchGoals(userId),
    fetchSettings(userId),
  ])

  useTransactionsStore.getState().setTransactions(transactions)
  useBillsStore.getState().setBills(bills)
  useGoalsStore.getState().setGoals(goals)

  if (settings) {
    const store = useSettingsStore.getState()
    store.setBaseCurrency(settings.baseCurrency)
    store.setTheme(settings.theme as Theme)
    store.setMonthlyBudget(settings.monthlyBudget)
  } else {
    const s = useSettingsStore.getState().settings
    await upsertSettings(userId, {
      baseCurrency: s.baseCurrency,
      theme: s.theme,
      monthlyBudget: s.monthlyBudget,
    })
  }

  if (transactions.length === 0 && bills.length === 0 && goals.length === 0) {
    await seedDemoData(userId)
  }
}

function clearUserData() {
  useTransactionsStore.getState().setTransactions([])
  useBillsStore.getState().setBills([])
  useGoalsStore.getState().setGoals([])
}

export function useAuth() {
  const { user, loading, setUser, setLoading } = useAuthStore()

  useEffect(() => {
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
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
  }

  return { user, loading, signOut }
}
