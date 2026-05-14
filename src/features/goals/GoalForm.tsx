import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CURRENCY_LIST } from '../../lib/currencies'
import { todayISO } from '../../lib/dateUtils'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { goalSchema, type GoalInput } from './schemas'
import type { Goal } from '../../types'

interface GoalFormProps {
  initial?: Goal
  onSubmit: (data: GoalInput) => void
  onCancel: () => void
}

export function GoalForm({ initial, onSubmit, onCancel }: GoalFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<GoalInput>({
    resolver: zodResolver(goalSchema),
    defaultValues: initial
      ? {
          name: initial.name,
          targetAmount: initial.targetAmount,
          currentAmount: initial.currentAmount,
          currency: initial.currency,
          targetDate: initial.targetDate,
        }
      : {
          currentAmount: 0,
          currency: 'USD',
          targetDate: todayISO(),
          name: '',
        },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="Goal name"
        placeholder="e.g. Emergency Fund, Vacation…"
        error={errors.name?.message}
        {...register('name')}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Target amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          error={errors.targetAmount?.message}
          {...register('targetAmount', { valueAsNumber: true })}
        />
        <Input
          label="Current amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          error={errors.currentAmount?.message}
          {...register('currentAmount', { valueAsNumber: true })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
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
        <Input
          label="Target date"
          type="date"
          error={errors.targetDate?.message}
          {...register('targetDate')}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting} className="flex-1">
          {initial ? 'Save Changes' : 'Add Goal'}
        </Button>
      </div>
    </form>
  )
}
