import { Pencil, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import type { Transaction } from '../../types'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { formatDate } from '../../lib/dateUtils'
import { formatMoney } from '../../lib/currencies'
import { cn } from '../../lib/utils'

interface TransactionItemProps {
  transaction: Transaction
  onEdit: (t: Transaction) => void
  onDelete: (id: string) => void
  isSelectMode: boolean
  isSelected: boolean
  onToggleSelect: (id: string) => void
}

export function TransactionItem({
  transaction,
  onEdit,
  onDelete,
  isSelectMode,
  isSelected,
  onToggleSelect,
}: TransactionItemProps) {
  const isIncome = transaction.type === 'income'

  return (
    <div
      className={cn(
        'flex items-center gap-3 py-3 group transition-colors',
        isSelectMode && 'cursor-pointer select-none',
        isSelected && 'bg-brand-50/60 dark:bg-brand-950/40 -mx-4 px-4 rounded-xl',
      )}
      onClick={isSelectMode ? () => onToggleSelect(transaction.id) : undefined}
    >
      {isSelectMode ? (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(transaction.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded accent-brand-500 cursor-pointer flex-shrink-0"
          aria-label={`Select ${transaction.description}`}
        />
      ) : (
        <div
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
            isIncome
              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
              : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
          )}
        >
          {isIncome ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {transaction.description}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {formatDate(transaction.date)}
          </span>
          <Badge category={transaction.category} className="py-0.5" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={cn(
            'text-sm font-semibold tabular-nums',
            isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white',
          )}
        >
          {isIncome ? '+' : '-'}{formatMoney(transaction.amount, transaction.currency)}
        </span>

        {!isSelectMode && (
          <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); onEdit(transaction) }}
              aria-label="Edit transaction"
              className="h-8 w-8"
            >
              <Pencil size={13} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); onDelete(transaction.id) }}
              aria-label="Delete transaction"
              className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <Trash2 size={13} />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
