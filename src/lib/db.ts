import { supabase } from './supabase'
import type { Transaction, Bill, Goal, CategoryDef } from '../types'

// ── Row mappers (DB snake_case ↔ app camelCase) ────────────────────────────

function rowToTransaction(r: Record<string, unknown>): Transaction {
  return {
    id: r.id as string,
    date: r.date as string,
    description: r.description as string,
    amount: Number(r.amount),
    type: r.type as Transaction['type'],
    category: r.category as Transaction['category'],
    currency: r.currency as string,
    note: r.note as string | undefined,
    createdAt: r.created_at as string,
  }
}

function rowToBill(r: Record<string, unknown>): Bill {
  return {
    id: r.id as string,
    name: r.name as string,
    amount: Number(r.amount),
    currency: r.currency as string,
    frequency: r.frequency as Bill['frequency'],
    nextDueDate: r.next_due_date as string,
    category: r.category as string,
    note: r.note as string | undefined,
    percentOfIncome: r.percent_of_income != null ? Number(r.percent_of_income) : undefined,
    endDate: r.end_date as string | undefined,
  }
}

function rowToGoal(r: Record<string, unknown>): Goal {
  return {
    id: r.id as string,
    name: r.name as string,
    targetAmount: Number(r.target_amount),
    currentAmount: Number(r.current_amount),
    currency: r.currency as string,
    targetDate: r.target_date as string,
    createdAt: r.created_at as string,
  }
}

// ── Auth helper ────────────────────────────────────────────────────────────

async function uid(): Promise<string | null> {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

// ── Transactions ───────────────────────────────────────────────────────────

export async function fetchTransactions(userId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  if (error) throw error
  return (data as Record<string, unknown>[]).map(rowToTransaction)
}

export async function insertTransaction(t: Transaction): Promise<void> {
  const userId = await uid()
  if (!userId) return
  const { error } = await supabase.from('transactions').insert({
    id: t.id,
    user_id: userId,
    date: t.date,
    description: t.description,
    amount: t.amount,
    type: t.type,
    category: t.category,
    currency: t.currency,
    note: t.note ?? null,
    created_at: t.createdAt,
  })
  if (error) console.error('insertTransaction:', error.message)
}

export async function updateTransaction(id: string, patch: Partial<Transaction>): Promise<void> {
  const row: Record<string, unknown> = {}
  if (patch.date !== undefined) row.date = patch.date
  if (patch.description !== undefined) row.description = patch.description
  if (patch.amount !== undefined) row.amount = patch.amount
  if (patch.type !== undefined) row.type = patch.type
  if (patch.category !== undefined) row.category = patch.category
  if (patch.currency !== undefined) row.currency = patch.currency
  if (patch.note !== undefined) row.note = patch.note
  const { error } = await supabase.from('transactions').update(row).eq('id', id)
  if (error) console.error('updateTransaction:', error.message)
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) console.error('deleteTransaction:', error.message)
}

// ── Bills ──────────────────────────────────────────────────────────────────

export async function fetchBills(userId: string): Promise<Bill[]> {
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error
  return (data as Record<string, unknown>[]).map(rowToBill)
}

export async function insertBill(b: Bill): Promise<void> {
  const userId = await uid()
  if (!userId) return
  const { error } = await supabase.from('bills').insert({
    id: b.id,
    user_id: userId,
    name: b.name,
    amount: b.amount,
    currency: b.currency,
    frequency: b.frequency,
    next_due_date: b.nextDueDate,
    category: b.category,
    note: b.note ?? null,
    percent_of_income: b.percentOfIncome ?? null,
    end_date: b.endDate ?? null,
  })
  if (error) console.error('insertBill:', error.message)
}

export async function updateBill(id: string, patch: Partial<Bill>): Promise<void> {
  const row: Record<string, unknown> = {}
  if (patch.name !== undefined) row.name = patch.name
  if (patch.amount !== undefined) row.amount = patch.amount
  if (patch.currency !== undefined) row.currency = patch.currency
  if (patch.frequency !== undefined) row.frequency = patch.frequency
  if (patch.nextDueDate !== undefined) row.next_due_date = patch.nextDueDate
  if (patch.category !== undefined) row.category = patch.category
  if (patch.note !== undefined) row.note = patch.note
  if (patch.percentOfIncome !== undefined) row.percent_of_income = patch.percentOfIncome ?? null
  if (patch.endDate !== undefined) row.end_date = patch.endDate ?? null
  const { error } = await supabase.from('bills').update(row).eq('id', id)
  if (error) console.error('updateBill:', error.message)
}

export async function deleteBill(id: string): Promise<void> {
  const { error } = await supabase.from('bills').delete().eq('id', id)
  if (error) console.error('deleteBill:', error.message)
}

// ── Goals ──────────────────────────────────────────────────────────────────

export async function fetchGoals(userId: string): Promise<Goal[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error
  return (data as Record<string, unknown>[]).map(rowToGoal)
}

export async function insertGoal(g: Goal): Promise<void> {
  const userId = await uid()
  if (!userId) return
  const { error } = await supabase.from('goals').insert({
    id: g.id,
    user_id: userId,
    name: g.name,
    target_amount: g.targetAmount,
    current_amount: g.currentAmount,
    currency: g.currency,
    target_date: g.targetDate,
    created_at: g.createdAt,
  })
  if (error) console.error('insertGoal:', error.message)
}

export async function updateGoal(id: string, patch: Partial<Goal>): Promise<void> {
  const row: Record<string, unknown> = {}
  if (patch.name !== undefined) row.name = patch.name
  if (patch.targetAmount !== undefined) row.target_amount = patch.targetAmount
  if (patch.currentAmount !== undefined) row.current_amount = patch.currentAmount
  if (patch.currency !== undefined) row.currency = patch.currency
  if (patch.targetDate !== undefined) row.target_date = patch.targetDate
  const { error } = await supabase.from('goals').update(row).eq('id', id)
  if (error) console.error('updateGoal:', error.message)
}

export async function deleteGoal(id: string): Promise<void> {
  const { error } = await supabase.from('goals').delete().eq('id', id)
  if (error) console.error('deleteGoal:', error.message)
}

// ── User settings ──────────────────────────────────────────────────────────

export interface DbSettings {
  baseCurrency: string
  theme: string
  monthlyBudget: number
  monthlyIncome: number
  categoryBudgets: Record<string, number>
}

export async function fetchSettings(userId: string): Promise<DbSettings | null> {
  const { data } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (!data) return null
  return {
    baseCurrency: data.base_currency as string,
    theme: data.theme as string,
    monthlyBudget: Number(data.monthly_budget),
    monthlyIncome: Number(data.monthly_income ?? 0),
    categoryBudgets: (data.category_budgets as Record<string, number>) ?? {},
  }
}

export async function upsertSettings(userId: string, s: Partial<DbSettings>): Promise<void> {
  const row: Record<string, unknown> = { user_id: userId }
  if (s.baseCurrency !== undefined) row.base_currency = s.baseCurrency
  if (s.theme !== undefined) row.theme = s.theme
  if (s.monthlyBudget !== undefined) row.monthly_budget = s.monthlyBudget
  if (s.monthlyIncome !== undefined) row.monthly_income = s.monthlyIncome
  if (s.categoryBudgets !== undefined) row.category_budgets = s.categoryBudgets
  const { error } = await supabase.from('user_settings').upsert(row)
  if (error) console.error('upsertSettings:', error.message)
}

// ── Custom categories ──────────────────────────────────────────────────────

export async function fetchCategories(userId: string): Promise<CategoryDef[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data as Record<string, unknown>[]).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    color: r.color as string,
    isBuiltin: false,
  }))
}

export async function insertCategory(cat: CategoryDef, userId: string): Promise<void> {
  const { error } = await supabase.from('categories').insert({
    id: cat.id,
    user_id: userId,
    name: cat.name,
    color: cat.color,
    sort_order: 0,
  })
  if (error) console.error('insertCategory:', error.message)
}

export async function deleteCategory(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) console.error('deleteCategory:', error.message)
}
