import { useMemo } from 'react'
import { create } from 'zustand'
import { BUILTIN_CATEGORIES, type CategoryDef } from '../types'

interface CategoriesState {
  customCategories: CategoryDef[]
  setCustomCategories: (cats: CategoryDef[]) => void
  addCustomCategory: (cat: CategoryDef) => void
  deleteCustomCategory: (id: string) => void
}

export const useCategoriesStore = create<CategoriesState>()((set) => ({
  customCategories: [],
  setCustomCategories: (cats) => set({ customCategories: cats }),
  addCustomCategory: (cat) =>
    set((s) => ({ customCategories: [...s.customCategories, cat] })),
  deleteCustomCategory: (id) =>
    set((s) => ({ customCategories: s.customCategories.filter((c) => c.id !== id) })),
}))

export function useAllCategories(): CategoryDef[] {
  const { customCategories } = useCategoriesStore()
  return useMemo(() => [...BUILTIN_CATEGORIES, ...customCategories], [customCategories])
}
