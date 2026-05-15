import { getCategoryDef, BUILTIN_CATEGORIES } from '../../types'
import { useCategoriesStore } from '../../store/categoriesSlice'
import { cn } from '../../lib/utils'

const BUILTIN_CLASSES: Record<string, string> = {
  food:          'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  transport:     'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  entertainment: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
  housing:       'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  health:        'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  savings:       'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  income:        'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  other:         'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

const BUILTIN_DOT_CLASSES: Record<string, string> = {
  food:          'bg-orange-500',
  transport:     'bg-violet-500',
  entertainment: 'bg-pink-500',
  housing:       'bg-teal-500',
  health:        'bg-green-500',
  savings:       'bg-blue-500',
  income:        'bg-emerald-500',
  other:         'bg-gray-400',
}

interface BadgeProps {
  category: string
  className?: string
}

export function Badge({ category, className }: BadgeProps) {
  const { customCategories } = useCategoriesStore()
  const builtinClass = BUILTIN_CLASSES[category]

  if (builtinClass) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
          builtinClass,
          className,
        )}
      >
        <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', BUILTIN_DOT_CLASSES[category])} />
        {BUILTIN_CATEGORIES.find((c) => c.id === category)?.name ?? category}
      </span>
    )
  }

  const def = getCategoryDef(category, customCategories)
  const color = def.color
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        className,
      )}
      style={{ backgroundColor: `${color}22`, color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      {def.name}
    </span>
  )
}
