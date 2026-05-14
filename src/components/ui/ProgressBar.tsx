import { cn } from '../../lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  colorVariant?: 'default' | 'success' | 'warning' | 'danger'
  animated?: boolean
  showLabel?: boolean
}

function getColorVariant(pct: number): 'success' | 'warning' | 'danger' {
  if (pct >= 90) return 'danger'
  if (pct >= 75) return 'warning'
  return 'success'
}

export function ProgressBar({
  value,
  max = 100,
  className,
  colorVariant,
  animated = true,
  showLabel = false,
}: ProgressBarProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100)
  const variant = colorVariant ?? getColorVariant(pct)

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full',
            animated && 'animate-progress-fill',
            variant === 'success' && 'bg-brand-500',
            variant === 'warning' && 'bg-amber-400',
            variant === 'danger' && 'bg-red-500',
          )}
          style={
            {
              '--progress-width': `${pct}%`,
              width: animated ? undefined : `${pct}%`,
            } as React.CSSProperties
          }
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-10 text-right">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  )
}
