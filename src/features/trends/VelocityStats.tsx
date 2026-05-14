import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardHeader } from '../../components/ui/Card'
import { formatMoney } from '../../lib/currencies'
import { getDaysElapsedInMonth, getDaysInCurrentMonth } from '../../lib/dateUtils'
import { cn } from '../../lib/utils'

interface VelocityStatsProps {
  thisMonthExpenses: number
  lastMonthExpenses: number
  currency: string
}

export function VelocityStats({ thisMonthExpenses, lastMonthExpenses, currency }: VelocityStatsProps) {
  const daysElapsed = getDaysElapsedInMonth()
  const daysInMonth = getDaysInCurrentMonth()

  const dailyAvgThis = daysElapsed > 0 ? thisMonthExpenses / daysElapsed : 0
  const dailyAvgLast = lastMonthExpenses > 0 ? lastMonthExpenses / daysInMonth : 0

  const delta = dailyAvgLast > 0 ? ((dailyAvgThis - dailyAvgLast) / dailyAvgLast) * 100 : 0
  const isLess = delta <= 0

  const projectedMonthly = dailyAvgThis * daysInMonth

  return (
    <Card>
      <CardHeader title="Spending Velocity" subtitle="Daily average vs last month" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">
            This month / day
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
            {formatMoney(dailyAvgThis, currency)}
          </p>
          <div className={cn('flex items-center gap-1 text-xs font-medium', isLess ? 'text-emerald-500' : 'text-red-500')}>
            {isLess ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
            {isLess ? '' : '+'}{delta.toFixed(1)}% vs last month
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">
            Last month / day
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
            {formatMoney(dailyAvgLast, currency)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Total: {formatMoney(lastMonthExpenses, currency)}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">
            Projected (this month)
          </p>
          <p
            className={cn(
              'text-2xl font-bold tabular-nums',
              projectedMonthly > lastMonthExpenses ? 'text-amber-500' : 'text-gray-900 dark:text-white',
            )}
          >
            {formatMoney(projectedMonthly, currency)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Based on {daysElapsed} days elapsed
          </p>
        </div>
      </div>
    </Card>
  )
}
