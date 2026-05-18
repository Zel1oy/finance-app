import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, RefreshCw, Download, CheckSquare, Square, AlertCircle } from 'lucide-react'
import { format, fromUnixTime, subDays } from 'date-fns'
import { useSettingsStore, useAuthStore, useAllCategories, useTransactionsStore } from '../../store'
import { fetchMonoClientInfo, fetchMonoStatement, monoCurrencyToIso } from '../../lib/monobank'
import { categoryFromMcc, autoCategory } from '../../lib/categorize'
import * as db from '../../lib/db'
import { cn } from '../../lib/utils'
import type { Transaction } from '../../types'
import type { MonoAccount, MonoStatement } from '../../lib/monobank'

interface ImportRow {
  item: MonoStatement
  checked: boolean
  category: string
}

type DaysOption = 7 | 14 | 30 | 90

interface Props {
  isOpen: boolean
  onClose: () => void
}

function resolveCategory(item: MonoStatement): string {
  if (item.amount > 0) return 'income'
  const mccCat = categoryFromMcc(item.mcc)
  return mccCat !== 'other' ? mccCat : autoCategory(item.description)
}

export function MonobankImportModal({ isOpen, onClose }: Props) {
  const { settings } = useSettingsStore()
  const { user } = useAuthStore()
  const { addTransaction } = useTransactionsStore()
  const allCategories = useAllCategories()

  const [days, setDays] = useState<DaysOption>(30)
  const [accounts, setAccounts] = useState<MonoAccount[]>([])
  const [selectedAccount, setSelectedAccount] = useState('')
  const [rows, setRows] = useState<ImportRow[]>([])
  const [existingIds, setExistingIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importedCount, setImportedCount] = useState<number | null>(null)

  useEffect(() => {
    if (!isOpen || !user) return
    db.fetchExternalIds(user.id).then(setExistingIds).catch(() => {})
  }, [isOpen, user])

  useEffect(() => {
    if (!isOpen) {
      setAccounts([])
      setSelectedAccount('')
      setRows([])
      setError(null)
      setImportedCount(null)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const checkedRows = rows.filter((r) => r.checked)
  const allChecked = rows.length > 0 && rows.every((r) => r.checked)

  function toggleAll() {
    setRows((prev) => prev.map((r) => ({ ...r, checked: !allChecked })))
  }

  function toggleRow(id: string) {
    setRows((prev) => prev.map((r) => (r.item.id === id ? { ...r, checked: !r.checked } : r)))
  }

  function setRowCategory(id: string, category: string) {
    setRows((prev) => prev.map((r) => (r.item.id === id ? { ...r, category } : r)))
  }

  async function handleLoad() {
    if (!settings.monobankToken) return
    setLoading(true)
    setError(null)
    setRows([])
    setImportedCount(null)

    try {
      let accs = accounts
      if (accs.length === 0) {
        accs = await fetchMonoClientInfo(settings.monobankToken)
        setAccounts(accs)
        if (accs.length > 0 && !selectedAccount) {
          setSelectedAccount(accs[0].id)
        }
      }

      const accountId = selectedAccount || accs[0]?.id || '0'
      const to = new Date()
      const from = subDays(to, days)

      const statements = await fetchMonoStatement(settings.monobankToken, accountId, from, to)

      const newRows: ImportRow[] = statements.map((item) => ({
        item,
        checked: !existingIds.has(item.id),
        category: resolveCategory(item),
      }))

      setRows(newRows)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  async function handleImport() {
    if (checkedRows.length === 0) return
    setImporting(true)

    for (const row of checkedRows) {
      const currency = monoCurrencyToIso(row.item.currencyCode)
      const t: Transaction = {
        id: crypto.randomUUID(),
        date: format(fromUnixTime(row.item.time), 'yyyy-MM-dd'),
        description: row.item.description,
        amount: Math.abs(row.item.amount) / 100,
        type: row.item.amount < 0 ? 'expense' : 'income',
        category: row.category,
        currency,
        note: row.item.comment,
        createdAt: new Date().toISOString(),
        externalId: row.item.id,
      }
      addTransaction(t)
      await db.insertTransaction(t)
    }

    setImportedCount(checkedRows.length)
    setImporting(false)
    setTimeout(onClose, 1200)
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
      <div className="relative w-full sm:max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-modal animate-slide-up max-h-[92dvh] flex flex-col sm:mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Import from Monobank
            </h2>
            {rows.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {checkedRows.length} of {rows.length} selected
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Controls */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 dark:border-gray-700 p-1">
            {([7, 14, 30, 90] as DaysOption[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={cn(
                  'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                  days === d
                    ? 'bg-brand-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                )}
              >
                {d}d
              </button>
            ))}
          </div>

          {accounts.length > 1 && (
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {monoCurrencyToIso(acc.currencyCode)}{' '}
                  {acc.maskedPan[0] ?? acc.type}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => void handleLoad()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors ml-auto"
          >
            <RefreshCw size={14} className={cn(loading && 'animate-spin')} />
            {loading ? 'Loading…' : 'Load'}
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="mx-6 mt-4 flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-3">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {importedCount !== null && (
            <div className="mx-6 mt-4 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 p-3">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                ✓ Imported {importedCount} transaction{importedCount !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {rows.length === 0 && !loading && !error && (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-12">
              Select a date range and tap <span className="font-medium text-gray-500 dark:text-gray-400">Load</span> to fetch transactions.
            </p>
          )}

          {rows.length > 0 && (
            <div className="px-4 py-2">
              {/* Select all row */}
              <button
                type="button"
                onClick={toggleAll}
                className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {allChecked
                  ? <CheckSquare size={16} className="text-brand-500 flex-shrink-0" />
                  : <Square size={16} className="text-gray-400 flex-shrink-0" />}
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {allChecked ? 'Deselect all' : 'Select all'}
                </span>
              </button>

              <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
                {rows.map((row) => {
                  const alreadyImported = existingIds.has(row.item.id)
                  const isExpense = row.item.amount < 0
                  const amount = Math.abs(row.item.amount) / 100
                  const currency = monoCurrencyToIso(row.item.currencyCode)
                  const dateStr = format(fromUnixTime(row.item.time), 'MMM d, yyyy')

                  return (
                    <div
                      key={row.item.id}
                      className={cn(
                        'flex items-start gap-3 py-3 px-2 rounded-xl transition-colors',
                        row.checked
                          ? 'opacity-100'
                          : 'opacity-60',
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => toggleRow(row.item.id)}
                        className="mt-0.5 flex-shrink-0 focus:outline-none"
                        aria-label={row.checked ? 'Deselect' : 'Select'}
                      >
                        {row.checked
                          ? <CheckSquare size={18} className="text-brand-500" />
                          : <Square size={18} className="text-gray-300 dark:text-gray-600" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                            {row.item.description}
                          </p>
                          <span
                            className={cn(
                              'text-sm font-semibold tabular-nums flex-shrink-0',
                              isExpense
                                ? 'text-gray-800 dark:text-gray-200'
                                : 'text-emerald-600 dark:text-emerald-400',
                            )}
                          >
                            {isExpense ? '−' : '+'}
                            {amount.toFixed(2)} {currency}
                          </span>
                        </div>

                        {row.item.comment && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                            {row.item.comment}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-xs text-gray-400 dark:text-gray-500">{dateStr}</span>

                          {alreadyImported && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5">
                              Already imported
                            </span>
                          )}

                          <select
                            value={row.category}
                            onChange={(e) => setRowCategory(row.item.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                          >
                            {allCategories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {rows.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {checkedRows.length} transaction{checkedRows.length !== 1 ? 's' : ''} selected
            </p>
            <button
              type="button"
              onClick={() => void handleImport()}
              disabled={importing || checkedRows.length === 0}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 transition-colors"
            >
              <Download size={15} />
              {importing ? 'Importing…' : `Import ${checkedRows.length}`}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
