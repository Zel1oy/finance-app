import type { Transaction } from '../../types'
import { TransactionItem } from './TransactionItem'
import { EmptyState } from '../../components/ui/EmptyState'
import { Receipt } from 'lucide-react'

interface TransactionListProps {
  transactions: Transaction[]
  onEdit: (t: Transaction) => void
  onDelete: (id: string) => void
}

export function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<Receipt size={22} />}
        title="No transactions yet"
        description="Add your first transaction to start tracking your finances."
      />
    )
  }

  return (
    <div className="divide-y divide-gray-50 dark:divide-gray-800">
      {transactions.map((t) => (
        <TransactionItem key={t.id} transaction={t} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}
