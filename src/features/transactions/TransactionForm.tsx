import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CATEGORIES, CATEGORY_LABELS } from '../../types'
import { CURRENCY_LIST } from '../../lib/currencies'
import { autoCategory } from '../../lib/categorize'
import { todayISO } from '../../lib/dateUtils'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { transactionSchema, type TransactionInput } from './schemas'
import type { Transaction } from '../../types'

interface TransactionFormProps {
  initial?: Transaction
  onSubmit: (data: TransactionInput) => void
  onCancel: () => void
}

export function TransactionForm({ initial, onSubmit, onCancel }: TransactionFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, touchedFields, isSubmitting },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: initial
      ? {
          date: initial.date,
          description: initial.description,
          amount: initial.amount,
          type: initial.type,
          category: initial.category,
          currency: initial.currency,
          note: initial.note ?? '',
        }
      : {
          date: todayISO(),
          type: 'expense',
          category: 'other',
          currency: 'USD',
          description: '',
          note: '',
        },
  })

  function handleDescriptionBlur(e: React.FocusEvent<HTMLInputElement>) {
    if (!touchedFields.category) {
      const suggested = autoCategory(e.target.value)
      setValue('category', suggested, { shouldValidate: false, shouldDirty: false })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Date"
          type="date"
          error={errors.date?.message}
          {...register('date')}
        />
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select label="Type" error={errors.type?.message} {...field}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </Select>
          )}
        />
      </div>

      <Input
        label="Description"
        placeholder="e.g. Whole Foods, Netflix…"
        error={errors.description?.message}
        {...register('description', {
          onBlur: handleDescriptionBlur,
        })}
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
        placeholder="Any additional details…"
        error={errors.note?.message}
        {...register('note')}
      />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting} className="flex-1">
          {initial ? 'Save Changes' : 'Add Transaction'}
        </Button>
      </div>
    </form>
  )
}
