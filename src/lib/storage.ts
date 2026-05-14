import { supabase } from './supabase'
import { useTransactionsStore } from '../store/transactionsSlice'
import { useBillsStore } from '../store/billsSlice'
import { useGoalsStore } from '../store/goalsSlice'
import type { Transaction, Bill, Goal } from '../types'

function isoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return isoDate(d)
}

function daysFromNow(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return isoDate(d)
}

export async function seedDemoData(userId: string) {
  const seedKey = `finance-app:seeded-v3-${userId}`
  if (localStorage.getItem(seedKey)) return

  const { setTransactions } = useTransactionsStore.getState()
  const { setBills } = useBillsStore.getState()
  const { setGoals } = useGoalsStore.getState()

  const transactions: Transaction[] = [
    // Current month
    { id: crypto.randomUUID(), date: daysAgo(0), description: 'Whole Foods grocery run', amount: 87.5, type: 'expense', category: 'food', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(1), description: 'Netflix subscription', amount: 15.99, type: 'expense', category: 'entertainment', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(2), description: 'Uber Eats dinner', amount: 42.8, type: 'expense', category: 'food', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(3), description: 'Gym membership', amount: 35, type: 'expense', category: 'health', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(4), description: 'Salary — May 2026', amount: 3500, type: 'income', category: 'income', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(5), description: 'Starbucks coffee', amount: 6.75, type: 'expense', category: 'food', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(6), description: 'Rent — May', amount: 1200, type: 'expense', category: 'housing', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(7), description: 'Uber ride', amount: 18.5, type: 'expense', category: 'transport', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(8), description: 'Doctor visit', amount: 50, type: 'expense', category: 'health', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(9), description: 'Amazon purchase', amount: 45.99, type: 'expense', category: 'other', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(10), description: 'Electricity bill', amount: 78.5, type: 'expense', category: 'housing', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(11), description: 'Gas station', amount: 52.3, type: 'expense', category: 'transport', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(12), description: 'Restaurant dinner', amount: 67.8, type: 'expense', category: 'food', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(13), description: 'Transfer to savings', amount: 200, type: 'expense', category: 'savings', currency: 'USD', createdAt: new Date().toISOString() },
    // Last month
    { id: crypto.randomUUID(), date: daysAgo(32), description: 'Salary — April 2026', amount: 3500, type: 'income', category: 'income', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(33), description: 'Rent — April', amount: 1200, type: 'expense', category: 'housing', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(34), description: 'Walmart grocery', amount: 120.8, type: 'expense', category: 'food', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(35), description: 'Spotify Premium', amount: 9.99, type: 'expense', category: 'entertainment', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(36), description: 'Netflix subscription', amount: 15.99, type: 'expense', category: 'entertainment', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(37), description: 'Taxi ride', amount: 22.5, type: 'expense', category: 'transport', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(38), description: 'Pharmacy', amount: 28.75, type: 'expense', category: 'health', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(39), description: 'Internet bill', amount: 69.99, type: 'expense', category: 'housing', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(40), description: 'Dinner out', amount: 89.5, type: 'expense', category: 'food', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(41), description: 'Steam game', amount: 29.99, type: 'expense', category: 'entertainment', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(42), description: 'Gas station', amount: 48.6, type: 'expense', category: 'transport', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(43), description: 'Gym membership', amount: 35, type: 'expense', category: 'health', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(44), description: 'Transfer to savings', amount: 300, type: 'expense', category: 'savings', currency: 'USD', createdAt: new Date().toISOString() },
    // Two months ago
    { id: crypto.randomUUID(), date: daysAgo(62), description: 'Salary — March 2026', amount: 3500, type: 'income', category: 'income', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(63), description: 'Rent — March', amount: 1200, type: 'expense', category: 'housing', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(64), description: 'Grocery run', amount: 156.3, type: 'expense', category: 'food', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(65), description: 'Netflix subscription', amount: 15.99, type: 'expense', category: 'entertainment', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(66), description: 'Uber Eats', amount: 42.8, type: 'expense', category: 'food', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(67), description: 'Metro card top-up', amount: 32, type: 'expense', category: 'transport', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(68), description: 'Dentist appointment', amount: 120, type: 'expense', category: 'health', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(69), description: 'Electricity bill', amount: 82.3, type: 'expense', category: 'housing', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(70), description: 'Movie tickets', amount: 28.5, type: 'expense', category: 'entertainment', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(71), description: 'Gas station', amount: 55.4, type: 'expense', category: 'transport', currency: 'USD', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), date: daysAgo(72), description: 'Restaurant dinner', amount: 78.6, type: 'expense', category: 'food', currency: 'USD', createdAt: new Date().toISOString() },
  ]

  const bills: Bill[] = [
    {
      id: crypto.randomUUID(),
      name: 'Apartment Rent',
      amount: 1200,
      currency: 'USD',
      frequency: 'monthly',
      nextDueDate: daysFromNow(17),
      category: 'housing',
    },
    {
      id: crypto.randomUUID(),
      name: 'Netflix',
      amount: 15.99,
      currency: 'USD',
      frequency: 'monthly',
      nextDueDate: daysFromNow(5),
      category: 'entertainment',
    },
    {
      id: crypto.randomUUID(),
      name: 'Gym Membership',
      amount: 35,
      currency: 'USD',
      frequency: 'monthly',
      nextDueDate: daysFromNow(2),
      category: 'health',
    },
    {
      id: crypto.randomUUID(),
      name: 'Internet Bill',
      amount: 69.99,
      currency: 'USD',
      frequency: 'monthly',
      nextDueDate: daysFromNow(12),
      category: 'housing',
    },
    {
      id: crypto.randomUUID(),
      name: 'Spotify',
      amount: 9.99,
      currency: 'USD',
      frequency: 'monthly',
      nextDueDate: daysFromNow(8),
      category: 'entertainment',
    },
  ]

  const goals: Goal[] = [
    {
      id: crypto.randomUUID(),
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 3500,
      currency: 'USD',
      targetDate: daysFromNow(365),
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: 'Vacation 2026',
      targetAmount: 3000,
      currentAmount: 850,
      currency: 'USD',
      targetDate: daysFromNow(120),
      createdAt: new Date().toISOString(),
    },
  ]

  setTransactions(transactions)
  setBills(bills)
  setGoals(goals)

  await Promise.all([
    supabase.from('transactions').insert(
      transactions.map((t) => ({
        id: t.id, user_id: userId, date: t.date, description: t.description,
        amount: t.amount, type: t.type, category: t.category, currency: t.currency,
        note: t.note ?? null, created_at: t.createdAt,
      }))
    ),
    supabase.from('bills').insert(
      bills.map((b) => ({
        id: b.id, user_id: userId, name: b.name, amount: b.amount,
        currency: b.currency, frequency: b.frequency, next_due_date: b.nextDueDate,
        category: b.category, note: b.note ?? null,
      }))
    ),
    supabase.from('goals').insert(
      goals.map((g) => ({
        id: g.id, user_id: userId, name: g.name, target_amount: g.targetAmount,
        current_amount: g.currentAmount, currency: g.currency,
        target_date: g.targetDate, created_at: g.createdAt,
      }))
    ),
  ])

  localStorage.setItem(seedKey, '1')
}
