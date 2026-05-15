import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts'
import { Card, CardHeader } from '../../components/ui/Card'
import { formatMoney } from '../../lib/currencies'
import { getCategoryDef } from '../../types'
import type { CategoryDef } from '../../types'

interface DonutEntry {
  name: string
  value: number
  color: string
}

interface CategoryDonutChartProps {
  categoryTotals: Record<string, number>
  allCategories: CategoryDef[]
  currency: string
  isDark: boolean
}

export function CategoryDonutChart({
  categoryTotals,
  allCategories,
  currency,
  isDark,
}: CategoryDonutChartProps) {
  const data: DonutEntry[] = Object.entries(categoryTotals)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([id, value]) => {
      const def = getCategoryDef(id, allCategories.filter((c) => !c.isBuiltin))
      return { name: def.name, value: Math.round(value), color: def.color }
    })

  const total = data.reduce((s, d) => s + d.value, 0)

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader title="Spending by Category" subtitle="This month" />
        <div className="h-48 flex items-center justify-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">No expenses this month</p>
        </div>
      </Card>
    )
  }

  const textColor = isDark ? '#9ca3af' : '#6b7280'

  return (
    <Card>
      <CardHeader title="Spending by Category" subtitle="This month" />
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            dataKey="value"
            nameKey="name"
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
            <Label
              content={({ viewBox }) => {
                const vb = viewBox as { cx?: number; cy?: number }
                const cx = vb.cx ?? 0
                const cy = vb.cy ?? 0
                return (
                  <text textAnchor="middle" dominantBaseline="middle">
                    <tspan x={cx} y={cy - 8} fontSize="11" fill={textColor}>Total</tspan>
                    <tspan x={cx} y={cy + 10} fontSize="13" fontWeight="600" fill={isDark ? '#f9fafb' : '#111827'}>
                      {formatMoney(total, currency)}
                    </tspan>
                  </text>
                )
              }}
            />
          </Pie>
          <Tooltip
            formatter={(value) => [
              `${formatMoney(typeof value === 'number' ? value : 0, currency)} (${total > 0 ? Math.round(((typeof value === 'number' ? value : 0) / total) * 100) : 0}%)`,
              '',
            ]}
            contentStyle={{
              backgroundColor: isDark ? '#111827' : '#ffffff',
              border: `1px solid ${isDark ? '#1f2937' : '#e5e7eb'}`,
              borderRadius: '0.75rem',
              fontSize: 12,
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: textColor }}
            formatter={(value) => {
              const item = data.find((d) => d.name === value)
              const pct = total > 0 && item ? Math.round((item.value / total) * 100) : 0
              return `${String(value)} ${pct}%`
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}
