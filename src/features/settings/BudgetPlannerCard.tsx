import { useState } from 'react'
import { useSettingsStore, useAuthStore } from '../../store'
import { useAllCategories } from '../../store/categoriesSlice'
import { upsertSettings } from '../../lib/db'
import { formatMoney } from '../../lib/currencies'
import { Button } from '../../components/ui/Button'
import { cn } from '../../lib/utils'

export function BudgetPlannerCard() {
  const { settings, setMonthlyIncome, setCategoryBudgets } = useSettingsStore()
  const { user } = useAuthStore()
  const allCategories = useAllCategories()

  const [income, setIncome] = useState(settings.monthlyIncome ?? 0)
  const [budgets, setBudgets] = useState<Record<string, number>>({ ...(settings.categoryBudgets ?? {}) })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const totalAllocated = Object.values(budgets).reduce((s, v) => s + (v || 0), 0)
  const isOver = totalAllocated > 100

  async function handleSave() {
    setSaving(true)
    setMonthlyIncome(income)
    setCategoryBudgets(budgets)
    if (user) {
      await upsertSettings(user.id, { monthlyIncome: income, categoryBudgets: budgets })
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Monthly income ({settings.baseCurrency})
        </label>
        <input
          type="number"
          min="0"
          step="1"
          placeholder="e.g. 3500"
          value={income || ''}
          onChange={(e) => setIncome(Number(e.target.value))}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Used to calculate % bills and budget allocations
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Budget per category (% of income)
          </p>
          <span className={cn(
            'text-sm font-semibold tabular-nums',
            isOver ? 'text-red-500' : totalAllocated === 100 ? 'text-emerald-500' : 'text-gray-500',
          )}>
            {totalAllocated.toFixed(1)}% allocated
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {allCategories.filter((c) => c.id !== 'income').map((cat) => {
            const pct = budgets[cat.id] ?? 0
            const amountPerMonth = income > 0 ? (income * pct) / 100 : 0
            return (
              <div key={cat.id} className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-sm text-gray-700 dark:text-gray-300 w-32 truncate">{cat.name}</span>
                <div className="flex items-center gap-1.5 flex-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={pct || ''}
                    placeholder="0"
                    onChange={(e) => {
                      const v = Math.min(100, Math.max(0, Number(e.target.value)))
                      setBudgets((prev) => ({ ...prev, [cat.id]: v }))
                    }}
                    className="w-16 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-sm text-right tabular-nums text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-xs text-gray-400">%</span>
                </div>
                {income > 0 && pct > 0 && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums w-20 text-right">
                    {formatMoney(amountPerMonth, settings.baseCurrency)}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {isOver && (
          <p className="text-xs text-red-500 mt-3">
            Total exceeds 100%. Reduce some categories.
          </p>
        )}
      </div>

      <Button
        onClick={() => void handleSave()}
        loading={saving}
        size="sm"
        className="self-start"
        disabled={isOver}
      >
        {saved ? '✓ Saved' : 'Save Budget Plan'}
      </Button>
    </div>
  )
}
