import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled ?? loading}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 cursor-pointer',
        variant === 'primary' &&
          'bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.97] shadow-sm',
        variant === 'ghost' &&
          'bg-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800',
        variant === 'outline' &&
          'border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-900',
        variant === 'danger' &&
          'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900',
        size === 'sm' && 'px-3 py-1.5 text-xs gap-1.5',
        size === 'md' && 'px-4 py-2 text-sm gap-2',
        size === 'lg' && 'px-6 py-3 text-base gap-2',
        size === 'icon' && 'p-2',
        (disabled ?? loading) && 'opacity-60 cursor-not-allowed',
        className,
      )}
    >
      {children}
    </button>
  )
}
