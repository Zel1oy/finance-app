import { useState } from 'react'
import { ListFilter, X, ChevronDown } from 'lucide-react'
import { CATEGORIES, CATEGORY_LABELS } from '../../types'
import { CURRENCY_LIST } from '../../lib/currencies'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { Input } from '../../components/ui/Input'
import { cn } from '../../lib/utils'
import type { TransactionFilters } from '../../store'

interface TransactionFiltersProps {
  filters: TransactionFilters
  onFiltersChange: (f: Partial<TransactionFilters>) => void
  onReset: () => void
}

const hasActiveFilters = (f: TransactionFilters) =>
  f.category !== null ||
  f.currency !== null ||
  f.type !== null ||
  f.dateFrom !== null ||
  f.dateTo !== null ||
  f.search !== ''

const hasNonSearchFilters = (f: TransactionFilters) =>
  f.category !== null || f.currency !== null || f.type !== null ||
  f.dateFrom !== null || f.dateTo !== null

export function TransactionFiltersBar({
  filters,
  onFiltersChange,
  onReset,
}: TransactionFiltersProps) {
  const active = hasActiveFilters(filters)
  const nonSearchActive = hasNonSearchFilters(filters)
  const [expanded, setExpanded] = useState(false)
  const showDropdowns = expanded

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search transactions…"
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="h-10"
          />
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={cn(
            'sm:hidden flex-shrink-0 flex items-center gap-1.5 h-10 px-3 rounded-xl border text-sm font-medium transition-colors',
            nonSearchActive
              ? 'border-brand-400 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400'
              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900',
          )}
          aria-expanded={expanded}
          aria-label="Toggle filters"
        >
          <ListFilter size={15} />
          <ChevronDown size={13} className={cn('transition-transform', expanded && 'rotate-180')} />
          {nonSearchActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 absolute top-1 right-1" />
          )}
        </button>

        {active && (
          <Button variant="ghost" size="sm" onClick={onReset} className="flex-shrink-0 text-gray-500">
            <X size={14} />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        )}
      </div>

      <div className={cn('flex-col gap-2', showDropdowns ? 'flex sm:flex' : 'hidden sm:flex')}>
        <div className="flex flex-wrap gap-2">
          <Select
            value={filters.type ?? ''}
            onChange={(e) =>
              onFiltersChange({ type: (e.target.value as TransactionFilters['type']) || null })
            }
            className="h-9 py-0 text-xs flex-1 sm:flex-none sm:min-w-[110px]"
            aria-label="Filter by type"
          >
            <option value="">All types</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </Select>

          <Select
            value={filters.category ?? ''}
            onChange={(e) =>
              onFiltersChange({ category: (e.target.value as TransactionFilters['category']) || null })
            }
            className="h-9 py-0 text-xs flex-1 sm:flex-none sm:min-w-[140px]"
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </Select>

          <Select
            value={filters.currency ?? ''}
            onChange={(e) => onFiltersChange({ currency: e.target.value || null })}
            className="h-9 py-0 text-xs flex-1 sm:flex-none sm:min-w-[100px]"
            aria-label="Filter by currency"
          >
            <option value="">All currencies</option>
            {CURRENCY_LIST.map((c) => (
              <option key={c.code} value={c.code}>{c.code}</option>
            ))}
          </Select>
        </div>

        <div className="flex gap-2">
          <Input
            type="date"
            value={filters.dateFrom ?? ''}
            onChange={(e) => onFiltersChange({ dateFrom: e.target.value || null })}
            className="h-9 py-0 text-xs flex-1"
            aria-label="From date"
          />
          <Input
            type="date"
            value={filters.dateTo ?? ''}
            onChange={(e) => onFiltersChange({ dateTo: e.target.value || null })}
            className="h-9 py-0 text-xs flex-1"
            aria-label="To date"
          />
        </div>
      </div>

      {active && !showDropdowns && (
        <p className="sm:hidden text-xs text-brand-600 dark:text-brand-400 flex items-center gap-1">
          <ListFilter size={11} />
          {[
            nonSearchActive && 'Filters active',
            filters.search && `"${filters.search}"`,
          ].filter(Boolean).join(' · ')}
        </p>
      )}
    </div>
  )
}
