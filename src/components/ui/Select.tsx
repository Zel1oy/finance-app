import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, className, id, children, ...props }, ref) => {
    const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full rounded-xl border bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 transition-colors appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
            error
              ? 'border-red-400 dark:border-red-500'
              : 'border-gray-200 dark:border-gray-700',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
      </div>
    )
  },
)
Select.displayName = 'Select'
