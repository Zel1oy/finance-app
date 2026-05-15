import { Pencil, Trash2, Calendar } from 'lucide-react'
import type { Bill } from '../../types'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { formatRelativeDate, getDaysRemaining } from '../../lib/dateUtils'
import { useSettingsStore } from '../../store'
import { useFormatMoney } from '../../hooks/useFormatMoney'
import { cn } from '../../lib/utils'

interface BillItemProps {
  bill: Bill
  onEdit: (b: Bill) => void
  onDelete: (id: string) => void
}

const FREQUENCY_LABELS: Record<Bill['frequency'], string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
}

export function BillItem({ bill, onEdit, onDelete }: BillItemProps) {
  const { settings } = useSettingsStore()
  const { fmt } = useFormatMoney()
  const daysLeft = getDaysRemaining(bill.nextDueDate)
  const isOverdue = daysLeft < 0
  const isSoon = daysLeft >= 0 && daysLeft <= 3

  const isPercent = bill.percentOfIncome != null && bill.percentOfIncome > 0
  const calculatedAmount = isPercent
    ? (settings.monthlyIncome * (bill.percentOfIncome ?? 0)) / 100
    : bill.amount
  const billCurrency = isPercent ? settings.baseCurrency : bill.currency

  return (
    <div className="flex items-center gap-3 py-3 group">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
        <Calendar size={16} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{bill.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className={cn(
              'text-xs',
              isOverdue
                ? 'text-red-500 dark:text-red-400 font-medium'
                : isSoon
                ? 'text-amber-500 dark:text-amber-400 font-medium'
                : 'text-gray-400 dark:text-gray-500',
            )}
          >
            {formatRelativeDate(bill.nextDueDate)}
          </span>
          <span className="text-xs text-gray-300 dark:text-gray-700">·</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {FREQUENCY_LABELS[bill.frequency]}
          </span>
          <Badge category={bill.category} className="py-0.5" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-right">
          {isPercent && (
            <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">
              {bill.percentOfIncome}% of income
            </p>
          )}
          <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
            {isPercent ? '≈ ' : ''}{fmt(calculatedAmount, billCurrency)}
          </span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" onClick={() => onEdit(bill)} aria-label="Edit bill" className="h-7 w-7">
            <Pencil size={13} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(bill.id)}
            aria-label="Delete bill"
            className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <Trash2 size={13} />
          </Button>
        </div>
      </div>
    </div>
  )
}
