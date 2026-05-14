import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 text-gray-400 dark:text-gray-500">
        {icon ?? <Inbox size={22} />}
      </div>
      <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{title}</p>
      {description && (
        <p className="text-xs text-gray-400 dark:text-gray-500 max-w-[220px] mb-4">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
