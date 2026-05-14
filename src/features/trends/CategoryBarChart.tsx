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
import { CATEGORY_LABELS } from '../../types'
import type { Category } from '../../types'

interface ChartDataPoint {
  category: string
  thisMonth: number
  lastMonth: number
}

interface CategoryBarChartProps {
  thisMonth: Record<Category, number>
  lastMonth: Record<Category, number>
  currency: string
  isDark: boolean
}

function buildData(
  thisMonth: Record<Category, number>,
  lastMonth: Record<Category, number>,
): ChartDataPoint[] {
  const categories: Category[] = [
    'food', 'housing', 'transport', 'entertainment', 'health', 'savings', 'other',
  ]
  return categories
    .map((c) => ({
      category: CATEGORY_LABELS[c].split(' ')[0]!,
      thisMonth: Math.round(thisMonth[c]),
      lastMonth: Math.round(lastMonth[c]),
    }))
    .filter((d) => d.thisMonth > 0 || d.lastMonth > 0)
}

export function CategoryBarChart({ thisMonth, lastMonth, currency, isDark }: CategoryBarChartProps) {
  const data = buildData(thisMonth, lastMonth)
  const gridColor = isDark ? '#1f2937' : '#f3f4f6'
  const textColor = isDark ? '#9ca3af' : '#6b7280'

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader title="Spending by Category" />
        <div className="h-64 flex items-center justify-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">No expense data for these months.</p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title="Spending by Category" subtitle="This month vs last month" />
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="category"
            tick={{ fontSize: 11, fill: textColor }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => formatMoneyCompact(v, currency)}
            tick={{ fontSize: 11, fill: textColor }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip
            formatter={(value) => [typeof value === 'number' ? formatMoney(value, currency) : String(value), '']}
            contentStyle={{
              backgroundColor: isDark ? '#111827' : '#ffffff',
              border: `1px solid ${isDark ? '#1f2937' : '#e5e7eb'}`,
              borderRadius: '0.75rem',
              fontSize: 12,
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: textColor, paddingTop: 8 }}
          />
          <Bar dataKey="thisMonth" name="This Month" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="lastMonth" name="Last Month" fill="#bfdbfe" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
