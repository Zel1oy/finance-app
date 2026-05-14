import { Link } from 'react-router-dom'
import { Card, CardHeader } from '../../components/ui/Card'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { formatMoney } from '../../lib/currencies'
import { getDaysElapsedInMonth, getDaysInCurrentMonth } from '../../lib/dateUtils'
import { cn } from '../../lib/utils'

interface SpendingWidgetProps {
  expenses: number
  income: number
  budget: number
  currency: string
}

export function SpendingWidget({ expenses, income, budget, currency }: SpendingWidgetProps) {
  const daysElapsed = getDaysElapsedInMonth()
  const daysTotal = getDaysInCurrentMonth()
  const daysLeft = daysTotal - daysElapsed

  return (
    <Card className="flex flex-col gap-4">
      <CardHeader
        title="Monthly Spending"
        subtitle={`${daysLeft} days left in month`}
        action={
          <Link
            to="/transactions"
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
          >
            All transactions
          </Link>
        }
      />

      <div className="flex flex-col gap-1">
        <div className="flex items-end justify-between">
          <span className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
            {formatMoney(expenses, currency)}
          </span>
          {budget > 0 && (
            <span className="text-sm text-gray-400 dark:text-gray-500 mb-1">
              of {formatMoney(budget, currency)}
            </span>
          )}
        </div>
        {budget > 0 && <ProgressBar value={expenses} max={budget} showLabel />}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-50 dark:border-gray-800">
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide mb-1">
            Income
          </p>
          <p className={cn('text-base font-semibold tabular-nums', 'text-emerald-600 dark:text-emerald-400')}>
            +{formatMoney(income, currency)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide mb-1">
            Net
          </p>
          <p
            className={cn(
              'text-base font-semibold tabular-nums',
              income - expenses >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-500 dark:text-red-400',
            )}
          >
            {income - expenses >= 0 ? '+' : ''}
            {formatMoney(income - expenses, currency)}
          </p>
        </div>
      </div>
    </Card>
  )
}
