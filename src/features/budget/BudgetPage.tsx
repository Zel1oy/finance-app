import { useState, useMemo } from 'react'
import { Check, Pencil, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  useSettingsStore,
  useAuthStore,
  useTransactionsStore,
  selectCategoryTotals,
} from '../../store'
import { useAllCategories } from '../../store/categoriesSlice'
import { useExchangeRates } from '../../hooks/useExchangeRates'
import { useFormatMoney } from '../../hooks/useFormatMoney'
import { upsertSettings } from '../../lib/db'
import { Button } from '../../components/ui/Button'
import { cn } from '../../lib/utils'

export function BudgetPage() {
  const { settings, setMonthlyIncome, setCategoryBudgets } = useSettingsStore()
  const { user } = useAuthStore()
  const { transactions } = useTransactionsStore()
  const allCategories = useAllCategories()
  const rates = useExchangeRates()
  const { fmt } = useFormatMoney()

  const [income, setIncome] = useState(settings.monthlyIncome ?? 0)
  const [editingIncome, setEditingIncome] = useState(false)
  const [budgets, setBudgets] = useState<Record<string, number>>(
    () => ({ ...(settings.categoryBudgets ?? {}) }),
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const now = new Date()
  const thisMonthTotals = useMemo(
    () =>
      selectCategoryTotals(
        transactions,
        now.getFullYear(),
        now.getMonth(),
        settings.baseCurrency,
        rates,
      ),
    [transactions, settings.baseCurrency, rates],
  )

  const categories = allCategories.filter((c) => c.id !== 'income')
  const totalAllocated = Object.values(budgets).reduce((s, v) => s + (v || 0), 0)
  const isOver = totalAllocated > 100
  const unallocated = Math.max(0, 100 - totalAllocated)
  const allocatedCategories = categories.filter((c) => (budgets[c.id] ?? 0) > 0)
  const totalSpentThisMonth = Object.values(thisMonthTotals).reduce((s, v) => s + v, 0)

  function setPct(id: string, raw: number) {
    const v = Math.min(100, Math.max(0, isNaN(raw) ? 0 : raw))
    setBudgets((prev) => ({ ...prev, [id]: v }))
  }

  async function handleSave() {
    setSaving(true)
    setMonthlyIncome(income)
    setCategoryBudgets(budgets)
    if (user) await upsertSettings(user.id, { monthlyIncome: income, categoryBudgets: budgets })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in max-w-lg pb-4">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Budget Planner</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Allocate your income across categories
          </p>
        </div>
        <Button
          onClick={() => void handleSave()}
          loading={saving}
          size="sm"
          disabled={isOver}
          className={cn(saved && 'bg-emerald-500! hover:bg-emerald-500!')}
        >
          {saved ? (
            <><Check size={14} /> Saved!</>
          ) : (
            'Save Plan'
          )}
        </Button>
      </div>

      {/* ── Income hero card ───────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-5 text-white shadow-lg">
        <div
          className="pointer-events-none absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-8 bottom-0 w-24 h-24 rounded-full bg-white/5"
          aria-hidden
        />

        <p className="text-sm text-blue-100 font-medium mb-2">Monthly Income</p>

        {editingIncome ? (
          <div className="flex items-baseline gap-2">
            <input
              type="number"
              autoFocus
              min="0"
              step="100"
              value={income || ''}
              placeholder="0"
              onChange={(e) => setIncome(Number(e.target.value))}
              onBlur={() => setEditingIncome(false)}
              onKeyDown={(e) => { if (e.key === 'Enter') setEditingIncome(false) }}
              className="bg-white/20 border border-white/30 text-white placeholder-white/40 rounded-xl px-4 py-2 text-3xl font-bold w-full focus:outline-none focus:ring-2 focus:ring-white/40"
            />
            <span className="text-blue-200 text-sm flex-shrink-0">{settings.baseCurrency}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditingIncome(true)}
            className="flex items-center gap-2 group text-left"
            aria-label="Edit monthly income"
          >
            <span className="text-3xl font-bold text-white">
              {income > 0 ? fmt(income, settings.baseCurrency) : 'Tap to set income'}
            </span>
            <Pencil
              size={16}
              className="text-blue-200 group-hover:text-white transition-colors flex-shrink-0"
            />
          </button>
        )}

        <div className="flex items-center gap-4 mt-4 text-xs text-blue-200">
          <span>
            <span className="font-semibold text-white">{totalAllocated.toFixed(0)}%</span> planned
          </span>
          <span className="w-px h-3 bg-white/20" />
          <span>
            <span className={cn('font-semibold', isOver ? 'text-red-300' : 'text-white')}>
              {unallocated.toFixed(0)}%
            </span>{' '}
            {isOver ? 'over-allocated' : 'free'}
          </span>
          {income > 0 && totalSpentThisMonth > 0 && (
            <>
              <span className="w-px h-3 bg-white/20" />
              <span>
                <span className="font-semibold text-white">
                  {fmt(totalSpentThisMonth, settings.baseCurrency)}
                </span>{' '}
                spent
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Allocation bar ─────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <div className="h-3 rounded-full overflow-hidden flex bg-gray-100 dark:bg-gray-800">
          {categories.map((cat) => {
            const pct = budgets[cat.id] ?? 0
            if (pct === 0) return null
            return (
              <div
                key={cat.id}
                style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: cat.color }}
                className="h-full transition-all duration-300 shrink-0"
                title={`${cat.name}: ${pct}%`}
              />
            )
          })}
        </div>

        {/* Legend dots */}
        {allocatedCategories.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {allocatedCategories.map((cat) => (
              <span key={cat.id} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                {cat.name} {budgets[cat.id]}%
              </span>
            ))}
            {unallocated > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-600">
                <span className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700" />
                Unallocated {unallocated.toFixed(0)}%
              </span>
            )}
          </div>
        )}

        {isOver && (
          <p className="text-xs text-red-500 font-medium">
            Over-allocated by {(totalAllocated - 100).toFixed(1)}% — reduce some categories to save.
          </p>
        )}
      </div>

      {/* ── Category cards ─────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-1">
          Categories
        </p>

        {categories.map((cat) => {
          const pct = budgets[cat.id] ?? 0
          const allocatedAmt = income > 0 && pct > 0 ? (income * pct) / 100 : 0
          const spent = thisMonthTotals[cat.id] ?? 0
          const usedPct = allocatedAmt > 0 ? Math.min((spent / allocatedAmt) * 100, 100) : 0
          const isOverBudget = allocatedAmt > 0 && spent > allocatedAmt
          const hasData = pct > 0 && income > 0

          return (
            <div
              key={cat.id}
              className={cn(
                'bg-white dark:bg-gray-900 rounded-2xl border transition-all duration-200 p-4',
                pct > 0
                  ? 'border-gray-100 dark:border-gray-800 shadow-card'
                  : 'border-dashed border-gray-200 dark:border-gray-800',
              )}
            >
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${cat.color}20` }}
                >
                  <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: cat.color }} />
                </div>

                {/* Name + amount */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {cat.name}
                  </p>
                  {hasData ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {fmt(allocatedAmt, settings.baseCurrency)}/mo
                    </p>
                  ) : (
                    <p className="text-xs text-gray-300 dark:text-gray-600">Not budgeted</p>
                  )}
                </div>

                {/* % input */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={pct || ''}
                    placeholder="0"
                    onChange={(e) => setPct(cat.id, Number(e.target.value))}
                    className="w-14 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-1.5 text-sm text-right tabular-nums font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-gray-900 transition-colors"
                  />
                  <span className="text-sm text-gray-400 dark:text-gray-500 font-medium">%</span>
                </div>
              </div>

              {/* Spending bar */}
              {hasData && (
                <div className="mt-3 flex flex-col gap-1.5">
                  <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${usedPct}%`,
                        backgroundColor: isOverBudget
                          ? '#ef4444'
                          : usedPct >= 80
                          ? '#f59e0b'
                          : cat.color,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={cn(isOverBudget ? 'text-red-500' : 'text-gray-400 dark:text-gray-500')}>
                      {isOverBudget
                        ? `Over by ${fmt(spent - allocatedAmt, settings.baseCurrency)}`
                        : `Spent ${fmt(spent, settings.baseCurrency)}`}
                    </span>
                    <span className="text-gray-400 dark:text-gray-500 tabular-nums">
                      {Math.round(usedPct)}% used
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Footer links ───────────────────────────────────── */}
      <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
        <Link
          to="/settings"
          className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm text-gray-600 dark:text-gray-400"
        >
          <span>Manage custom categories</span>
          <ChevronRight size={15} className="text-gray-400" />
        </Link>
      </div>
    </div>
  )
}
