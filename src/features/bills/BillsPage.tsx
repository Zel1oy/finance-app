import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useBillsStore } from '../../store'
import * as db from '../../lib/db'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { BillList } from './BillList'
import { BillForm } from './BillForm'
import type { Bill } from '../../types'
import type { BillInput } from './schemas'

export function BillsPage() {
  const { bills, addBill, updateBill, deleteBill } = useBillsStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<Bill | null>(null)

  function handleAdd(data: BillInput) {
    const { amountType, ...billData } = data
    const b: Bill = {
      ...billData,
      id: crypto.randomUUID(),
      amount: amountType === 'percent' ? 0 : billData.amount,
      percentOfIncome: amountType === 'percent' ? billData.percentOfIncome : undefined,
    }
    addBill(b)
    void db.insertBill(b)
    setIsModalOpen(false)
  }

  function handleEdit(data: BillInput) {
    if (editing) {
      const { amountType, ...billData } = data
      const patch: Partial<Bill> = {
        ...billData,
        amount: amountType === 'percent' ? 0 : billData.amount,
        percentOfIncome: amountType === 'percent' ? billData.percentOfIncome : undefined,
      }
      updateBill(editing.id, patch)
      void db.updateBill(editing.id, patch)
      setEditing(null)
    }
  }

  function handleDelete(id: string) {
    if (confirm('Delete this bill?')) {
      deleteBill(id)
      void db.deleteBill(id)
    }
  }

  const sorted = [...bills].sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate))

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Recurring Bills</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {bills.length} bills tracked
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          <Plus size={15} />
          Add Bill
        </Button>
      </div>

      <Card padding="none">
        <div className="px-4">
          <BillList bills={sorted} onEdit={setEditing} onDelete={handleDelete} />
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Recurring Bill">
        <BillForm onSubmit={handleAdd} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      <Modal isOpen={editing !== null} onClose={() => setEditing(null)} title="Edit Bill">
        {editing && (
          <BillForm
            initial={editing}
            onSubmit={handleEdit}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  )
}
