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
import { convertAmount } from '../../lib/currencies'
import { SpendingWidget } from './SpendingWidget'
import { UpcomingBillsWidget } from './UpcomingBillsWidget'
import { GoalProgressCards } from './GoalProgressCards'
import { RecentTransactions } from './RecentTransactions'
import { BudgetProgressCard } from './BudgetProgressCard'

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

  const displayCurrency = settings.displayCurrency || settings.baseCurrency
  const displayExpenses = convertAmount(expenses, settings.baseCurrency, displayCurrency, rates)
  const displayIncome = convertAmount(income, settings.baseCurrency, displayCurrency, rates)
  const displayBudget = settings.monthlyBudget > 0
    ? convertAmount(settings.monthlyBudget, settings.baseCurrency, displayCurrency, rates)
    : 0

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
          expenses={displayExpenses}
          income={displayIncome}
          budget={displayBudget}
          currency={displayCurrency}
        />
        <UpcomingBillsWidget bills={upcomingBills} />
      </div>

      <GoalProgressCards goals={goals} />
      <BudgetProgressCard />
      <RecentTransactions transactions={sortedTransactions} />
    </div>
  )
}
