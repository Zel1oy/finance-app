import { useState } from 'react'
import { Plus, PiggyBank } from 'lucide-react'
import { useGoalsStore } from '../../store'
import * as db from '../../lib/db'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { GoalCard } from './GoalCard'
import { GoalForm } from './GoalForm'
import type { Goal } from '../../types'
import type { GoalInput } from './schemas'

export function GoalsPage() {
  const { goals, addGoal, updateGoal, deleteGoal, addToGoal } = useGoalsStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<Goal | null>(null)

  function handleAdd(data: GoalInput) {
    const g: Goal = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    addGoal(g)
    void db.insertGoal(g)
    setIsModalOpen(false)
  }

  function handleEdit(data: GoalInput) {
    if (editing) {
      updateGoal(editing.id, data)
      void db.updateGoal(editing.id, data)
      setEditing(null)
    }
  }

  function handleDelete(id: string) {
    if (confirm('Delete this goal?')) {
      deleteGoal(id)
      void db.deleteGoal(id)
    }
  }

  function handleContribute(id: string, amount: number) {
    const goal = goals.find((g) => g.id === id)
    if (!goal) return
    const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount)
    addToGoal(id, amount)
    void db.updateGoal(id, { currentAmount: newAmount })
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Savings Goals</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {goals.length} goals tracked
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          <Plus size={15} />
          Add Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          icon={<PiggyBank size={22} />}
          title="No goals yet"
          description="Create a savings goal and track your progress."
          action={
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              <Plus size={14} />
              Add Goal
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {goals.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              onEdit={setEditing}
              onDelete={handleDelete}
              onContribute={handleContribute}
            />
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Goal">
        <GoalForm onSubmit={handleAdd} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      <Modal isOpen={editing !== null} onClose={() => setEditing(null)} title="Edit Goal">
        {editing && (
          <GoalForm
            initial={editing}
            onSubmit={handleEdit}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  )
}
