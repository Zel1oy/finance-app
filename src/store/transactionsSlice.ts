import { create } from 'zustand'
import type { Transaction, TransactionType } from '../types'
import { convertAmount } from '../lib/currencies'

export interface TransactionFilters {
  dateFrom: string | null
  dateTo: string | null
  category: string | null
  currency: string | null
  type: TransactionType | null
  search: string
}

const DEFAULT_FILTERS: TransactionFilters = {
  dateFrom: null,
  dateTo: null,
  category: null,
  currency: null,
  type: null,
  search: '',
}

interface TransactionsState {
  transactions: Transaction[]
  filters: TransactionFilters
  addTransaction: (t: Transaction) => void
  updateTransaction: (id: string, patch: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  setFilters: (f: Partial<TransactionFilters>) => void
  resetFilters: () => void
  setTransactions: (transactions: Transaction[]) => void
}

export const useTransactionsStore = create<TransactionsState>()((set) => ({
  transactions: [],
  filters: DEFAULT_FILTERS,
  addTransaction: (t) =>
    set((state) => ({ transactions: [...state.transactions, t] })),
  updateTransaction: (id, patch) =>
    set((state) => ({
      transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),
  deleteTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    })),
  setFilters: (f) =>
    set((state) => ({ filters: { ...state.filters, ...f } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
  setTransactions: (transactions) => set({ transactions }),
}))

export function selectFilteredTransactions(
  transactions: Transaction[],
  filters: TransactionFilters,
): Transaction[] {
  return transactions
    .filter((t) => {
      if (filters.category && t.category !== filters.category) return false
      if (filters.currency && t.currency !== filters.currency) return false
      if (filters.type && t.type !== filters.type) return false
      if (filters.dateFrom && t.date < filters.dateFrom) return false
      if (filters.dateTo && t.date > filters.dateTo) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (!t.description.toLowerCase().includes(q)) return false
      }
      return true
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
}

export function selectMonthlyTotals(
  transactions: Transaction[],
  year: number,
  month: number,
  baseCurrency: string,
  rates: Record<string, number>,
): { expenses: number; income: number } {
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
  let expenses = 0
  let income = 0
  for (const t of transactions) {
    if (!t.date.startsWith(monthStr)) continue
    const converted = convertAmount(t.amount, t.currency, baseCurrency, rates)
    if (t.type === 'expense') {
      expenses += converted
    } else {
      income += converted
    }
  }
  return { expenses, income }
}

export function selectCategoryTotals(
  transactions: Transaction[],
  year: number,
  month: number,
  baseCurrency: string,
  rates: Record<string, number>,
): Record<string, number> {
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
  const totals: Record<string, number> = {}
  for (const t of transactions) {
    if (!t.date.startsWith(monthStr) || t.type !== 'expense') continue
    const converted = convertAmount(t.amount, t.currency, baseCurrency, rates)
    totals[t.category] = (totals[t.category] ?? 0) + converted
  }
  return totals
}
