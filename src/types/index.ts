export type Category =
  | 'food'
  | 'transport'
  | 'entertainment'
  | 'housing'
  | 'health'
  | 'savings'
  | 'income'
  | 'other'

export type TransactionType = 'expense' | 'income'
export type Frequency = 'weekly' | 'monthly' | 'yearly'
export type Theme = 'light' | 'dark' | 'system'

export const CATEGORIES: Category[] = [
  'food',
  'transport',
  'entertainment',
  'housing',
  'health',
  'savings',
  'income',
  'other',
]

export const CATEGORY_LABELS: Record<Category, string> = {
  food: 'Food & Dining',
  transport: 'Transport',
  entertainment: 'Entertainment',
  housing: 'Housing',
  health: 'Health & Fitness',
  savings: 'Savings',
  income: 'Income',
  other: 'Other',
}

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: TransactionType
  category: Category
  currency: string
  note?: string
  createdAt: string
}

export interface Bill {
  id: string
  name: string
  amount: number
  currency: string
  frequency: Frequency
  nextDueDate: string
  category: Category
  note?: string
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
  theme: Theme
  monthlyBudget: number
  rateCache: RateCache | null
}
