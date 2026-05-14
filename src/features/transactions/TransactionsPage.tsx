import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useTransactionsStore, selectFilteredTransactions } from '../../store'
import * as db from '../../lib/db'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { TransactionList } from './TransactionList'
import { TransactionForm } from './TransactionForm'
import { TransactionFiltersBar } from './TransactionFilters'
import type { Transaction } from '../../types'
import type { TransactionInput } from './schemas'

export function TransactionsPage() {
  const { transactions, filters, addTransaction, updateTransaction, deleteTransaction, setFilters, resetFilters } =
    useTransactionsStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)

  const filtered = useMemo(
    () => selectFilteredTransactions(transactions, filters),
    [transactions, filters],
  )

  function handleAdd(data: TransactionInput) {
    const t: Transaction = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    addTransaction(t)
    void db.insertTransaction(t)
    setIsModalOpen(false)
  }

  function handleEdit(data: TransactionInput) {
    if (editing) {
      updateTransaction(editing.id, data)
      void db.updateTransaction(editing.id, data)
      setEditing(null)
    }
  }

  function openEdit(t: Transaction) {
    setEditing(t)
  }

  function handleDelete(id: string) {
    if (confirm('Delete this transaction?')) {
      deleteTransaction(id)
      void db.deleteTransaction(id)
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {transactions.length} total • {filtered.length} shown
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          <Plus size={15} />
          Add
        </Button>
      </div>

      <Card padding="md">
        <TransactionFiltersBar filters={filters} onFiltersChange={setFilters} onReset={resetFilters} />
      </Card>

      <Card padding="none">
        <div className="px-4">
          <TransactionList transactions={filtered} onEdit={openEdit} onDelete={handleDelete} />
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Transaction"
      >
        <TransactionForm
          onSubmit={handleAdd}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={editing !== null}
        onClose={() => setEditing(null)}
        title="Edit Transaction"
      >
        {editing && (
          <TransactionForm
            initial={editing}
            onSubmit={handleEdit}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  )
}
