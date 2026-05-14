import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CATEGORIES, CATEGORY_LABELS } from '../../types'
import { CURRENCY_LIST } from '../../lib/currencies'
import { todayISO } from '../../lib/dateUtils'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { billSchema, type BillInput } from './schemas'
import type { Bill } from '../../types'

interface BillFormProps {
  initial?: Bill
  onSubmit: (data: BillInput) => void
  onCancel: () => void
}

export function BillForm({ initial, onSubmit, onCancel }: BillFormProps) {
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
          amount: initial.amount,
          currency: initial.currency,
          frequency: initial.frequency,
          nextDueDate: initial.nextDueDate,
          category: initial.category,
          note: initial.note ?? '',
        }
      : {
          frequency: 'monthly',
          category: 'housing',
          currency: 'USD',
          nextDueDate: todayISO(),
          name: '',
          note: '',
        },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="Bill name"
        placeholder="e.g. Rent, Netflix…"
        error={errors.name?.message}
        {...register('name')}
      />

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
                <option key={c.code} value={c.code}>
                  {c.code} — {c.symbol}
                </option>
              ))}
            </Select>
          )}
        />
      </div>

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
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
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
