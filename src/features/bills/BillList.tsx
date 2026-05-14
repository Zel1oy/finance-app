import type { Bill } from '../../types'
import { BillItem } from './BillItem'
import { EmptyState } from '../../components/ui/EmptyState'
import { Repeat } from 'lucide-react'

interface BillListProps {
  bills: Bill[]
  onEdit: (b: Bill) => void
  onDelete: (id: string) => void
}

export function BillList({ bills, onEdit, onDelete }: BillListProps) {
  if (bills.length === 0) {
    return (
      <EmptyState
        icon={<Repeat size={22} />}
        title="No recurring bills"
        description="Add your bills to track upcoming payments."
      />
    )
  }

  return (
    <div className="divide-y divide-gray-50 dark:divide-gray-800">
      {bills.map((b) => (
        <BillItem key={b.id} bill={b} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}
