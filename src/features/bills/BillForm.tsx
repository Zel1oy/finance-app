import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAllCategories } from '../../store/categoriesSlice'
import { CURRENCY_LIST } from '../../lib/currencies'
import { todayISO } from '../../lib/dateUtils'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { cn } from '../../lib/utils'
import { billSchema, type BillInput } from './schemas'
import type { Bill } from '../../types'

interface BillFormProps {
  initial?: Bill
  onSubmit: (data: BillInput) => void
  onCancel: () => void
}

export function BillForm({ initial, onSubmit, onCancel }: BillFormProps) {
  const allCategories = useAllCategories()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BillInput>({
    resolver: zodResolver(billSchema),
    defaultValues: initial
      ? {
          name: initial.name,
          amountType: initial.percentOfIncome != null ? 'percent' : 'fixed',
          amount: initial.amount,
          currency: initial.currency,
          percentOfIncome: initial.percentOfIncome,
          frequency: initial.frequency,
          nextDueDate: initial.nextDueDate,
          category: initial.category,
          note: initial.note ?? '',
        }
      : {
          amountType: 'fixed',
          frequency: 'monthly',
          category: 'housing',
          currency: 'USD',
          nextDueDate: todayISO(),
          amount: 0,
          name: '',
          note: '',
        },
  })

  const amountType = useWatch({ control, name: 'amountType' })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="Bill name"
        placeholder="e.g. Rent, Netflix, Tithe…"
        error={errors.name?.message}
        {...register('name')}
      />

      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Amount type</p>
        <Controller
          name="amountType"
          control={control}
          render={({ field }) => (
            <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {(['fixed', 'percent'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => field.onChange(type)}
                  className={cn(
                    'flex-1 py-2.5 text-sm font-medium transition-all',
                    field.value === type
                      ? 'bg-brand-500 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
                  )}
                >
                  {type === 'fixed' ? 'Fixed amount' : '% of income'}
                </button>
              ))}
            </div>
          )}
        />
      </div>

      {amountType === 'fixed' ? (
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            error={errors.amount?.message}
            {...register('amount', { valueAsNumber: true })}
          />
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <Select label="Currency" error={errors.currency?.message} {...field}>
                {CURRENCY_LIST.map((c) => (
                  <option key={c.code} value={c.code}>{c.code} — {c.symbol}</option>
                ))}
              </Select>
            )}
          />
        </div>
      ) : (
        <Input
          label="Percentage of monthly income"
          type="number"
          step="0.1"
          min="0.1"
          max="100"
          placeholder="e.g. 10"
          hint="The bill amount auto-calculates from your monthly income setting"
          error={errors.percentOfIncome?.message}
          {...register('percentOfIncome', { valueAsNumber: true })}
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <Controller
          name="frequency"
          control={control}
          render={({ field }) => (
            <Select label="Frequency" error={errors.frequency?.message} {...field}>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </Select>
          )}
        />
        <Input
          label="Next due date"
          type="date"
          error={errors.nextDueDate?.message}
          {...register('nextDueDate')}
        />
      </div>

      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <Select label="Category" error={errors.category?.message} {...field}>
            {allCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        )}
      />

      <Input
        label="Note (optional)"
        placeholder="Any details…"
        error={errors.note?.message}
        {...register('note')}
      />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting} className="flex-1">
          {initial ? 'Save Changes' : 'Add Bill'}
        </Button>
      </div>
    </form>
  )
}
