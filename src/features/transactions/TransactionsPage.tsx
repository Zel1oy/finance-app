import { useMemo, useState } from 'react'
import { Plus, CheckSquare, Trash2, Building2 } from 'lucide-react'
import { useTransactionsStore, selectFilteredTransactions, useSettingsStore } from '../../store'
import * as db from '../../lib/db'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { TransactionList } from './TransactionList'
import { TransactionForm } from './TransactionForm'
import { TransactionFiltersBar } from './TransactionFilters'
import { MonobankImportModal } from './MonobankImportModal'
import type { Transaction } from '../../types'
import type { TransactionInput } from './schemas'

export function TransactionsPage() {
  const { transactions, filters, addTransaction, updateTransaction, deleteTransaction, setFilters, resetFilters } =
    useTransactionsStore()
  const { settings } = useSettingsStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const filtered = useMemo(
    () => selectFilteredTransactions(transactions, filters),
    [transactions, filters],
  )

  function enterSelectMode() {
    setIsSelectMode(true)
    setSelectedIds(new Set())
  }

  function exitSelectMode() {
    setIsSelectMode(false)
    setSelectedIds(new Set())
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    const allIds = filtered.map((t) => t.id)
    const allSelected = allIds.every((id) => selectedIds.has(id))
    setSelectedIds(allSelected ? new Set() : new Set(allIds))
  }

  function handleBulkDelete() {
    if (selectedIds.size === 0) return
    if (!confirm(`Delete ${selectedIds.size} transaction${selectedIds.size > 1 ? 's' : ''}?`)) return
    for (const id of selectedIds) {
      deleteTransaction(id)
      void db.deleteTransaction(id)
    }
    exitSelectMode()
  }

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

  function handleDelete(id: string) {
    if (confirm('Delete this transaction?')) {
      deleteTransaction(id)
      void db.deleteTransaction(id)
    }
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center justify-between gap-2">
        {isSelectMode ? (
          <>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedIds.size > 0
                ? `${selectedIds.size} selected`
                : 'Tap rows to select'}
            </p>
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <Button variant="danger" size="sm" onClick={handleBulkDelete}>
                  <Trash2 size={14} />
                  Delete {selectedIds.size}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={exitSelectMode}>
                Done
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Transactions</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {transactions.length} total · {filtered.length} shown
              </p>
            </div>
            <div className="flex items-center gap-2">
              {filtered.length > 0 && (
                <Button variant="ghost" size="sm" onClick={enterSelectMode}>
                  <CheckSquare size={14} />
                  Select
                </Button>
              )}
              {settings.monobankToken && (
                <Button variant="outline" size="sm" onClick={() => setIsImportOpen(true)}>
                  <Building2 size={14} />
                  Monobank
                </Button>
              )}
              <Button onClick={() => setIsModalOpen(true)} size="sm">
                <Plus size={15} />
                Add
              </Button>
            </div>
          </>
        )}
      </div>

      <Card padding="md">
        <TransactionFiltersBar filters={filters} onFiltersChange={setFilters} onReset={resetFilters} />
      </Card>

      <Card padding="none">
        <div className="px-4">
          <TransactionList
            transactions={filtered}
            onEdit={setEditing}
            onDelete={handleDelete}
            isSelectMode={isSelectMode}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleAll={toggleAll}
          />
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Transaction">
        <TransactionForm onSubmit={handleAdd} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      <Modal isOpen={editing !== null} onClose={() => setEditing(null)} title="Edit Transaction">
        {editing && (
          <TransactionForm
            initial={editing}
            onSubmit={handleEdit}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <MonobankImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
    </div>
  )
}
