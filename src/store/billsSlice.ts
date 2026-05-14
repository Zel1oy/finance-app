import { create } from 'zustand'
import type { Bill } from '../types'
import { isWithinDays } from '../lib/dateUtils'

interface BillsState {
  bills: Bill[]
  addBill: (b: Bill) => void
  updateBill: (id: string, patch: Partial<Bill>) => void
  deleteBill: (id: string) => void
  setBills: (bills: Bill[]) => void
}

export const useBillsStore = create<BillsState>()((set) => ({
  bills: [],
  addBill: (b) =>
    set((state) => ({ bills: [...state.bills, b] })),
  updateBill: (id, patch) =>
    set((state) => ({
      bills: state.bills.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    })),
  deleteBill: (id) =>
    set((state) => ({ bills: state.bills.filter((b) => b.id !== id) })),
  setBills: (bills) => set({ bills }),
}))

export function selectUpcomingBills(bills: Bill[], withinDays: number): Bill[] {
  return bills
    .filter((b) => isWithinDays(b.nextDueDate, withinDays))
    .sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate))
}
