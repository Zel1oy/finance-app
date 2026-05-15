import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { AuthPage } from '../features/auth/AuthPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { TransactionsPage } from '../features/transactions/TransactionsPage'
import { BillsPage } from '../features/bills/BillsPage'
import { GoalsPage } from '../features/goals/GoalsPage'
import { TrendsPage } from '../features/trends/TrendsPage'
import { BudgetPage } from '../features/budget/BudgetPage'
import { SettingsPage } from '../features/settings/SettingsPage'

export const router = createBrowserRouter([
  { path: '/auth', element: <AuthPage /> },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'transactions', element: <TransactionsPage /> },
      { path: 'bills', element: <BillsPage /> },
      { path: 'goals', element: <GoalsPage /> },
      { path: 'trends', element: <TrendsPage /> },
      { path: 'budget', element: <BudgetPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])
