import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader } from '../../components/ui/Card'
import { formatMoney, formatMoneyCompact } from '../../lib/currencies'
import { format } from 'date-fns'

interface MonthData {
  month: string
  income: number
  expenses: number
  net: number
}

interface SixMonthChartProps {
  data: MonthData[]
  currency: string
  isDark: boolean
}

export function buildSixMonthData(
  transactions: { date: string; amount: number; type: string; currency: string }[],
  baseCurrency: string,
  rates: Record<string, number>,
  convertFn: (amount: number, from: string, to: string, rates: Record<string, number>) => number,
): MonthData[] {
  const now = new Date()
  const months: MonthData[] = []

  for (let i = 5; i >= 0; i--) {
    let year = now.getFullYear()
    let month = now.getMonth() - i
    while (month < 0) { month += 12; year -= 1 }

    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
    let income = 0
    let expenses = 0

    for (const t of transactions) {
      if (!t.date.startsWith(monthStr)) continue
      const converted = convertFn(t.amount, t.currency, baseCurrency, rates)
      if (t.type === 'income') income += converted
      else expenses += converted
    }

    months.push({
      month: format(new Date(year, month, 1), 'MMM'),
      income: Math.round(income),
      expenses: Math.round(expenses),
      net: Math.round(income - expenses),
    })
  }
  return months
}

export function SixMonthChart({ data, currency, isDark }: SixMonthChartProps) {
  const gridColor = isDark ? '#1f2937' : '#f3f4f6'
  const textColor = isDark ? '#9ca3af' : '#6b7280'

  return (
    <Card>
      <CardHeader title="6-Month Overview" subtitle="Income vs expenses by month" />
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: textColor }} axisLine={false} tickLine={false} />
          <YAxis
            tickFormatter={(v: number) => formatMoneyCompact(v, currency)}
            tick={{ fontSize: 11, fill: textColor }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip
            formatter={(value, name) => [
              formatMoney(typeof value === 'number' ? value : 0, currency),
              name,
            ]}
            contentStyle={{
              backgroundColor: isDark ? '#111827' : '#ffffff',
              border: `1px solid ${isDark ? '#1f2937' : '#e5e7eb'}`,
              borderRadius: '0.75rem',
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: textColor, paddingTop: 8 }} />
          <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="expenses" name="Expenses" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
