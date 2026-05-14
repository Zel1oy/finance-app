import { Link } from 'react-router-dom'
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { Card, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatMoney } from '../../lib/currencies'
import { formatDateShort } from '../../lib/dateUtils'
import type { Transaction } from '../../types'
import { Receipt } from 'lucide-react'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const recent = transactions.slice(0, 5)

  return (
    <Card className="flex flex-col gap-4">
      <CardHeader
        title="Recent Transactions"
        action={
          <Link
            to="/transactions"
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
          >
            View all
          </Link>
        }
      />

      {recent.length === 0 ? (
        <EmptyState
          icon={<Receipt size={18} />}
          title="No transactions yet"
          description="Your recent transactions will appear here."
        />
      ) : (
        <div className="flex flex-col divide-y divide-gray-50 dark:divide-gray-800">
          {recent.map((t) => {
            const isIncome = t.type === 'income'
            return (
              <div key={t.id} className="flex items-center gap-3 py-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isIncome
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-400'
                  }`}
                >
                  {isIncome ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {t.description}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-gray-400">{formatDateShort(t.date)}</span>
                    <Badge category={t.category} className="py-0 text-[10px]" />
                  </div>
                </div>

                <span
                  className={`text-sm font-semibold tabular-nums ${
                    isIncome
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {isIncome ? '+' : '-'}
                  {formatMoney(t.amount, t.currency)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
