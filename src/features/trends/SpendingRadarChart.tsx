import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import { Card, CardHeader } from '../../components/ui/Card'
import { CATEGORY_LABELS } from '../../types'
import type { Category } from '../../types'

interface RadarDataPoint {
  category: string
  thisMonth: number
  lastMonth: number
}

interface SpendingRadarChartProps {
  thisMonth: Record<Category, number>
  lastMonth: Record<Category, number>
  isDark: boolean
}

function buildRadarData(
  thisMonth: Record<Category, number>,
  lastMonth: Record<Category, number>,
): RadarDataPoint[] {
  const categories: Category[] = [
    'food', 'housing', 'transport', 'entertainment', 'health', 'savings', 'other',
  ]

  const maxThis = Math.max(...Object.values(thisMonth), 1)
  const maxLast = Math.max(...Object.values(lastMonth), 1)
  const maxAll = Math.max(maxThis, maxLast, 1)

  return categories.map((c) => ({
    category: CATEGORY_LABELS[c].split(' ')[0]!,
    thisMonth: Math.round((thisMonth[c] / maxAll) * 100),
    lastMonth: Math.round((lastMonth[c] / maxAll) * 100),
  }))
}

export function SpendingRadarChart({ thisMonth, lastMonth, isDark }: SpendingRadarChartProps) {
  const data = buildRadarData(thisMonth, lastMonth)
  const gridColor = isDark ? '#1f2937' : '#e5e7eb'
  const textColor = isDark ? '#9ca3af' : '#6b7280'

  return (
    <Card>
      <CardHeader title="Spending Pattern" subtitle="Normalized by category (% of peak spend)" />
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data}>
          <PolarGrid stroke={gridColor} />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fontSize: 11, fill: textColor }}
          />
          <Tooltip
            formatter={(value) => [`${typeof value === 'number' ? value : 0}%`, '']}
            contentStyle={{
              backgroundColor: isDark ? '#111827' : '#ffffff',
              border: `1px solid ${isDark ? '#1f2937' : '#e5e7eb'}`,
              borderRadius: '0.75rem',
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: textColor, paddingTop: 8 }} />
          <Radar
            name="This Month"
            dataKey="thisMonth"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.25}
          />
          <Radar
            name="Last Month"
            dataKey="lastMonth"
            stroke="#93c5fd"
            fill="#93c5fd"
            fillOpacity={0.15}
          />
        </RadarChart>
      </ResponsiveContainer>
    </Card>
  )
}
