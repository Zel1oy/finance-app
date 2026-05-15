import { useMemo } from 'react'
import {
  useTransactionsStore,
  useSettingsStore,
  selectMonthlyTotals,
  selectCategoryTotals,
} from '../../store'
import { useAllCategories } from '../../store/categoriesSlice'
import { useExchangeRates } from '../../hooks/useExchangeRates'
import { convertAmount } from '../../lib/currencies'
import { getPreviousMonth } from '../../lib/dateUtils'
import { VelocityStats } from './VelocityStats'
import { CategoryBarChart } from './CategoryBarChart'
import { SpendingRadarChart } from './SpendingRadarChart'
import { SixMonthChart, buildSixMonthData } from './SixMonthChart'
import { CategoryDonutChart } from './CategoryDonutChart'

export function TrendsPage() {
  const { transactions } = useTransactionsStore()
  const { settings } = useSettingsStore()
  const allCategories = useAllCategories()
  const rates = useExchangeRates()
  const isDark = document.documentElement.classList.contains('dark')

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const { year: prevYear, month: prevMonth } = getPreviousMonth(year, month)

  const { expenses: thisMonthExpenses } = useMemo(
    () => selectMonthlyTotals(transactions, year, month, settings.baseCurrency, rates),
    [transactions, year, month, settings.baseCurrency, rates],
  )

  const { expenses: lastMonthExpenses } = useMemo(
    () => selectMonthlyTotals(transactions, prevYear, prevMonth, settings.baseCurrency, rates),
    [transactions, prevYear, prevMonth, settings.baseCurrency, rates],
  )

  const thisMonthCategories = useMemo(
    () => selectCategoryTotals(transactions, year, month, settings.baseCurrency, rates),
    [transactions, year, month, settings.baseCurrency, rates],
  )

  const lastMonthCategories = useMemo(
    () => selectCategoryTotals(transactions, prevYear, prevMonth, settings.baseCurrency, rates),
    [transactions, prevYear, prevMonth, settings.baseCurrency, rates],
  )

  const sixMonthData = useMemo(
    () => buildSixMonthData(transactions, settings.baseCurrency, rates, convertAmount),
    [transactions, settings.baseCurrency, rates],
  )

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Trends</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Spending analysis and patterns
        </p>
      </div>

      <SixMonthChart data={sixMonthData} currency={settings.baseCurrency} isDark={isDark} />

      <CategoryDonutChart
        categoryTotals={thisMonthCategories}
        allCategories={allCategories}
        currency={settings.baseCurrency}
        isDark={isDark}
      />

      <VelocityStats
        thisMonthExpenses={thisMonthExpenses}
        lastMonthExpenses={lastMonthExpenses}
        currency={settings.baseCurrency}
      />

      <CategoryBarChart
        thisMonth={thisMonthCategories}
        lastMonth={lastMonthCategories}
        currency={settings.baseCurrency}
        isDark={isDark}
      />

      <SpendingRadarChart
        thisMonth={thisMonthCategories}
        lastMonth={lastMonthCategories}
        isDark={isDark}
      />
    </div>
  )
}
