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

interface RadarDataPoint {
  category: string
  thisMonth: number
  lastMonth: number
}

interface SpendingRadarChartProps {
  thisMonth: Record<string, number>
  lastMonth: Record<string, number>
  isDark: boolean
}

function buildRadarData(
  thisMonth: Record<string, number>,
  lastMonth: Record<string, number>,
): RadarDataPoint[] {
  const allIds = [...new Set([...Object.keys(thisMonth), ...Object.keys(lastMonth)])]
    .filter((id) => id !== 'income')

  const maxAll = Math.max(...allIds.flatMap((id) => [thisMonth[id] ?? 0, lastMonth[id] ?? 0]), 1)

  return allIds.map((id) => ({
    category: (CATEGORY_LABELS[id] ?? id).split(' ')[0]!,
    thisMonth: Math.round(((thisMonth[id] ?? 0) / maxAll) * 100),
    lastMonth: Math.round(((lastMonth[id] ?? 0) / maxAll) * 100),
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
