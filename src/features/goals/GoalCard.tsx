import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Trash2, Plus } from 'lucide-react'
import type { Goal } from '../../types'
import { Button } from '../../components/ui/Button'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { Input } from '../../components/ui/Input'
import { formatMoney } from '../../lib/currencies'
import { getDaysRemaining, formatDateShort } from '../../lib/dateUtils'
import { contributeSchema, type ContributeInput } from './schemas'
import { cn } from '../../lib/utils'

interface GoalCardProps {
  goal: Goal
  onEdit: (g: Goal) => void
  onDelete: (id: string) => void
  onContribute: (id: string, amount: number) => void
}

export function GoalCard({ goal, onEdit, onDelete, onContribute }: GoalCardProps) {
  const [showContribute, setShowContribute] = useState(false)
  const daysLeft = getDaysRemaining(goal.targetDate)
  const isComplete = goal.currentAmount >= goal.targetAmount

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContributeInput>({
    resolver: zodResolver(contributeSchema),
  })

  function handleContribute(data: ContributeInput) {
    onContribute(goal.id, data.amount)
    reset()
    setShowContribute(false)
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card p-5 flex flex-col gap-4 group">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{goal.name}</h3>
          <span
            className={cn(
              'text-xs mt-0.5',
              isComplete
                ? 'text-emerald-500 dark:text-emerald-400 font-medium'
                : daysLeft < 0
                ? 'text-red-500 dark:text-red-400'
                : 'text-gray-400 dark:text-gray-500',
            )}
          >
            {isComplete
              ? 'Goal reached! 🎉'
              : daysLeft < 0
              ? 'Past due'
              : `${daysLeft} days left · due ${formatDateShort(goal.targetDate)}`}
          </span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={() => onEdit(goal)} aria-label="Edit goal" className="h-7 w-7">
            <Pencil size={13} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(goal.id)}
            aria-label="Delete goal"
            className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <Trash2 size={13} />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <span className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">
            {formatMoney(goal.currentAmount, goal.currency)}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            of {formatMoney(goal.targetAmount, goal.currency)}
          </span>
        </div>
        <ProgressBar value={goal.currentAmount} max={goal.targetAmount} showLabel />
      </div>

      {!isComplete && (
        <>
          {showContribute ? (
            <form onSubmit={handleSubmit(handleContribute)} className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Amount"
                error={errors.amount?.message}
                className="h-9 py-0 text-sm flex-1"
                {...register('amount', { valueAsNumber: true })}
              />
              <Button type="submit" size="sm">Add</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowContribute(false)}>
                Cancel
              </Button>
            </form>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="self-start text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950"
              onClick={() => setShowContribute(true)}
            >
              <Plus size={13} />
              Contribute
            </Button>
          )}
        </>
      )}
    </div>
  )
}
