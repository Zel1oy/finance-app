import { useMemo } from 'react'
import {
  useTransactionsStore,
  useBillsStore,
  useGoalsStore,
  useSettingsStore,
  selectMonthlyTotals,
  selectUpcomingBills,
} from '../../store'
import { useExchangeRates } from '../../hooks/useExchangeRates'
import { SpendingWidget } from './SpendingWidget'
import { UpcomingBillsWidget } from './UpcomingBillsWidget'
import { GoalProgressCards } from './GoalProgressCards'
import { RecentTransactions } from './RecentTransactions'

export function DashboardPage() {
  const { transactions } = useTransactionsStore()
  const { bills } = useBillsStore()
  const { goals } = useGoalsStore()
  const { settings } = useSettingsStore()
  const rates = useExchangeRates()

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const { expenses, income } = useMemo(
    () => selectMonthlyTotals(transactions, year, month, settings.baseCurrency, rates),
    [transactions, year, month, settings.baseCurrency, rates],
  )

  const upcomingBills = useMemo(() => selectUpcomingBills(bills, 7), [bills])

  const sortedTransactions = useMemo(
    () =>
      [...transactions].sort(
        (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
      ),
    [transactions],
  )

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="mb-2">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SpendingWidget
          expenses={expenses}
          income={income}
          budget={settings.monthlyBudget}
          currency={settings.baseCurrency}
        />
        <UpcomingBillsWidget bills={upcomingBills} />
      </div>

      <GoalProgressCards goals={goals} />
      <RecentTransactions transactions={sortedTransactions} />
    </div>
  )
}
