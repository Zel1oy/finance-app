// Category is now an open string — any category id is valid
export type Category = string

export type TransactionType = 'expense' | 'income'
export type Frequency = 'weekly' | 'monthly' | 'yearly'
export type Theme = 'light' | 'dark' | 'system'

export interface CategoryDef {
  id: string
  name: string
  color: string       // hex like '#f97316'
  isBuiltin: boolean
}

export const BUILTIN_CATEGORIES: CategoryDef[] = [
  { id: 'food',          name: 'Food & Dining',   color: '#f97316', isBuiltin: true },
  { id: 'transport',     name: 'Transport',        color: '#8b5cf6', isBuiltin: true },
  { id: 'entertainment', name: 'Entertainment',    color: '#ec4899', isBuiltin: true },
  { id: 'housing',       name: 'Housing',          color: '#14b8a6', isBuiltin: true },
  { id: 'health',        name: 'Health & Fitness', color: '#22c55e', isBuiltin: true },
  { id: 'savings',       name: 'Savings',          color: '#3b82f6', isBuiltin: true },
  { id: 'income',        name: 'Income',           color: '#10b981', isBuiltin: true },
  { id: 'other',         name: 'Other',            color: '#6b7280', isBuiltin: true },
]

export function getCategoryDef(id: string, customCategories: CategoryDef[] = []): CategoryDef {
  return (
    BUILTIN_CATEGORIES.find((c) => c.id === id) ??
    customCategories.find((c) => c.id === id) ?? {
      id,
      name: id,
      color: '#6b7280',
      isBuiltin: false,
    }
  )
}

// Backward-compat aliases used by categorize.ts
export const CATEGORIES: string[] = BUILTIN_CATEGORIES.map((c) => c.id)
export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  BUILTIN_CATEGORIES.map((c) => [c.id, c.name]),
)

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: TransactionType
  category: string
  currency: string
  note?: string
  createdAt: string
  externalId?: string
}

export interface Bill {
  id: string
  name: string
  amount: number
  currency: string
  frequency: Frequency
  nextDueDate: string
  category: string
  note?: string
  percentOfIncome?: number  // 0–100; if set, amount is auto-calculated from monthlyIncome
  endDate?: string          // YYYY-MM-DD; if set, no transactions generated past this date
}

export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  currency: string
  targetDate: string
  createdAt: string
}

export interface RateCache {
  base: string
  rates: Record<string, number>
  fetchedAt: string
}

export interface Settings {
  baseCurrency: string
  displayCurrency: string              // currency amounts are shown in (defaults to baseCurrency)
  theme: Theme
  monthlyBudget: number
  monthlyIncome: number
  categoryBudgets: Record<string, number>  // category id → % of income (0–100)
  rateCache: RateCache | null
  monobankToken: string
}
