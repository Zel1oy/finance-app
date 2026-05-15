import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardHeader } from '../../components/ui/Card'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { formatMoney } from '../../lib/currencies'
import { useSettingsStore } from '../../store'
import { useAllCategories } from '../../store/categoriesSlice'
import { useTransactionsStore, selectCategoryTotals } from '../../store'
import { useExchangeRates } from '../../hooks/useExchangeRates'

export function BudgetProgressCard() {
  const { settings } = useSettingsStore()
  const { transactions } = useTransactionsStore()
  const allCategories = useAllCategories()
  const rates = useExchangeRates()

  const now = new Date()
  const categoryTotals = useMemo(
    () => selectCategoryTotals(transactions, now.getFullYear(), now.getMonth(), settings.baseCurrency, rates),
    [transactions, settings.baseCurrency, rates],
  )

  const budgetEntries = Object.entries(settings.categoryBudgets).filter(([, pct]) => pct > 0)

  if (budgetEntries.length === 0 || settings.monthlyIncome === 0) return null

  return (
    <Card className="flex flex-col gap-4">
      <CardHeader
        title="Budget Progress"
        subtitle={`Based on ${formatMoney(settings.monthlyIncome, settings.baseCurrency)} income`}
        action={
          <Link to="/settings" className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
            Edit
          </Link>
        }
      />

      <div className="flex flex-col gap-3">
        {budgetEntries.map(([catId, pct]) => {
          const cat = allCategories.find((c) => c.id === catId)
          if (!cat) return null
          const allocated = (settings.monthlyIncome * pct) / 100
          const spent = categoryTotals[catId] ?? 0
          const usedPct = allocated > 0 ? (spent / allocated) * 100 : 0

          return (
            <div key={catId} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
                  <span className="text-xs text-gray-400">({pct}%)</span>
                </div>
                <div className="text-right">
                  <span className={`text-xs tabular-nums font-medium ${
                    usedPct >= 100 ? 'text-red-500' : usedPct >= 80 ? 'text-amber-500' : 'text-gray-500'
                  }`}>
                    {formatMoney(spent, settings.baseCurrency)}
                  </span>
                  <span className="text-xs text-gray-400"> / {formatMoney(allocated, settings.baseCurrency)}</span>
                </div>
              </div>
              <ProgressBar
                value={spent}
                max={allocated}
                colorVariant={usedPct >= 100 ? 'danger' : usedPct >= 80 ? 'warning' : 'success'}
              />
            </div>
          )
        })}
      </div>
    </Card>
  )
}
