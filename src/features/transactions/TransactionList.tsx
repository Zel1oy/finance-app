import type { Transaction } from '../../types'
import { TransactionItem } from './TransactionItem'
import { EmptyState } from '../../components/ui/EmptyState'
import { Receipt } from 'lucide-react'

interface TransactionListProps {
  transactions: Transaction[]
  onEdit: (t: Transaction) => void
  onDelete: (id: string) => void
  isSelectMode: boolean
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  onToggleAll: () => void
}

export function TransactionList({
  transactions,
  onEdit,
  onDelete,
  isSelectMode,
  selectedIds,
  onToggleSelect,
  onToggleAll,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<Receipt size={22} />}
        title="No transactions yet"
        description="Add your first transaction to start tracking your finances."
      />
    )
  }

  const allSelected = transactions.length > 0 && transactions.every((t) => selectedIds.has(t.id))

  return (
    <div>
      {isSelectMode && (
        <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onToggleAll}
            className="w-4 h-4 rounded accent-brand-500 cursor-pointer"
            aria-label="Select all"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {allSelected ? 'Deselect all' : `Select all (${transactions.length})`}
          </span>
        </div>
      )}
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {transactions.map((t) => (
          <TransactionItem
            key={t.id}
            transaction={t}
            onEdit={onEdit}
            onDelete={onDelete}
            isSelectMode={isSelectMode}
            isSelected={selectedIds.has(t.id)}
            onToggleSelect={onToggleSelect}
          />
        ))}
      </div>
    </div>
  )
}
