import { Link } from 'react-router-dom'
import { Card, CardHeader } from '../../components/ui/Card'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatMoney } from '../../lib/currencies'
import { getDaysRemaining, formatDateShort } from '../../lib/dateUtils'
import { cn } from '../../lib/utils'
import type { Goal } from '../../types'
import { Target } from 'lucide-react'

interface GoalProgressCardsProps {
  goals: Goal[]
}

export function GoalProgressCards({ goals }: GoalProgressCardsProps) {
  return (
    <Card className="flex flex-col gap-4">
      <CardHeader
        title="Savings Goals"
        action={
          <Link
            to="/goals"
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
          >
            View all
          </Link>
        }
      />

      {goals.length === 0 ? (
        <EmptyState
          icon={<Target size={18} />}
          title="No goals yet"
          description="Create savings goals to track your progress."
        />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {goals.map((goal) => {
            const pct = (goal.currentAmount / goal.targetAmount) * 100
            const daysLeft = getDaysRemaining(goal.targetDate)
            const isComplete = goal.currentAmount >= goal.targetAmount

            return (
              <div
                key={goal.id}
                className="min-w-[200px] flex flex-col gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {goal.name}
                  </p>
                  <p
                    className={cn(
                      'text-xs mt-0.5',
                      isComplete
                        ? 'text-emerald-500 font-medium'
                        : daysLeft < 0
                        ? 'text-red-500'
                        : 'text-gray-400',
                    )}
                  >
                    {isComplete
                      ? 'Completed!'
                      : daysLeft < 0
                      ? 'Past due'
                      : `Due ${formatDateShort(goal.targetDate)}`}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                      {formatMoney(goal.currentAmount, goal.currency)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {Math.round(pct)}%
                    </span>
                  </div>
                  <ProgressBar value={goal.currentAmount} max={goal.targetAmount} />
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    of {formatMoney(goal.targetAmount, goal.currency)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
