import { create } from 'zustand'
import type { Goal } from '../types'

interface GoalsState {
  goals: Goal[]
  addGoal: (g: Goal) => void
  updateGoal: (id: string, patch: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  addToGoal: (id: string, amount: number) => void
  setGoals: (goals: Goal[]) => void
}

export const useGoalsStore = create<GoalsState>()((set) => ({
  goals: [],
  addGoal: (g) =>
    set((state) => ({ goals: [...state.goals, g] })),
  updateGoal: (id, patch) =>
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    })),
  deleteGoal: (id) =>
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) })),
  addToGoal: (id, amount) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id
          ? { ...g, currentAmount: Math.min(g.currentAmount + amount, g.targetAmount) }
          : g,
      ),
    })),
  setGoals: (goals) => set({ goals }),
}))
