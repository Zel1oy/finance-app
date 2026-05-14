import { ListFilter, X } from 'lucide-react'
import { CATEGORIES, CATEGORY_LABELS } from '../../types'
import { CURRENCY_LIST } from '../../lib/currencies'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { Input } from '../../components/ui/Input'
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

export function TransactionFiltersBar({
  filters,
  onFiltersChange,
  onReset,
}: TransactionFiltersProps) {
  const active = hasActiveFilters(filters)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search transactions…"
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="h-9 py-2"
          />
        </div>
        {active && (
          <Button variant="ghost" size="sm" onClick={onReset} className="gap-1.5 text-gray-500">
            <X size={14} />
            Clear
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Select
          value={filters.type ?? ''}
          onChange={(e) =>
            onFiltersChange({ type: (e.target.value as TransactionFilters['type']) || null })
          }
          className="h-9 py-0 text-xs w-auto min-w-[110px]"
          aria-label="Filter by type"
        >
          <option value="">All types</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </Select>

        <Select
          value={filters.category ?? ''}
          onChange={(e) =>
            onFiltersChange({
              category: (e.target.value as TransactionFilters['category']) || null,
            })
          }
          className="h-9 py-0 text-xs w-auto min-w-[140px]"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </Select>

        <Select
          value={filters.currency ?? ''}
          onChange={(e) =>
            onFiltersChange({ currency: e.target.value || null })
          }
          className="h-9 py-0 text-xs w-auto min-w-[110px]"
          aria-label="Filter by currency"
        >
          <option value="">All currencies</option>
          {CURRENCY_LIST.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code}
            </option>
          ))}
        </Select>

        <Input
          type="date"
          value={filters.dateFrom ?? ''}
          onChange={(e) => onFiltersChange({ dateFrom: e.target.value || null })}
          className="h-9 py-0 text-xs w-auto"
          aria-label="From date"
        />
        <Input
          type="date"
          value={filters.dateTo ?? ''}
          onChange={(e) => onFiltersChange({ dateTo: e.target.value || null })}
          className="h-9 py-0 text-xs w-auto"
          aria-label="To date"
        />
      </div>

      {active && (
        <div className="flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400">
          <ListFilter size={12} />
          Filters active
        </div>
      )}
    </div>
  )
}
