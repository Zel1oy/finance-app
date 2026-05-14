import { Link } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import { Card, CardHeader } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatMoney } from '../../lib/currencies'
import { formatRelativeDate, getDaysRemaining } from '../../lib/dateUtils'
import { cn } from '../../lib/utils'
import type { Bill } from '../../types'

interface UpcomingBillsWidgetProps {
  bills: Bill[]
}

export function UpcomingBillsWidget({ bills }: UpcomingBillsWidgetProps) {
  return (
    <Card className="flex flex-col gap-4">
      <CardHeader
        title="Upcoming Bills"
        subtitle="Next 7 days"
        action={
          <Link to="/bills" className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
            View all
          </Link>
        }
      />

      {bills.length === 0 ? (
        <EmptyState
          icon={<Calendar size={18} />}
          title="No bills due soon"
          description="Bills due in the next 7 days appear here."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {bills.slice(0, 5).map((bill) => {
            const daysLeft = getDaysRemaining(bill.nextDueDate)
            const isOverdue = daysLeft < 0
            const isSoon = daysLeft >= 0 && daysLeft <= 2

            return (
              <div key={bill.id} className="flex items-center justify-between py-1.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {bill.name}
                  </p>
                  <p
                    className={cn(
                      'text-xs mt-0.5',
                      isOverdue
                        ? 'text-red-500 dark:text-red-400'
                        : isSoon
                        ? 'text-amber-500 dark:text-amber-400'
                        : 'text-gray-400 dark:text-gray-500',
                    )}
                  >
                    {formatRelativeDate(bill.nextDueDate)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums ml-3">
                  {formatMoney(bill.amount, bill.currency)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
