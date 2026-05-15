import { z } from 'zod'

export const FREQUENCIES = ['weekly', 'monthly', 'yearly'] as const
export const AMOUNT_TYPES = ['fixed', 'percent'] as const
export const DURATION_TYPES = ['forever', 'months'] as const

export const billSchema = z.object({
  name: z.string().min(1, 'Name is required').max(60),
  amountType: z.enum(AMOUNT_TYPES),
  amount: z.number().min(0),
  currency: z.string().min(1, 'Currency is required'),
  percentOfIncome: z.number().min(0).max(100).optional(),
  frequency: z.enum(FREQUENCIES),
  nextDueDate: z.string().min(1, 'Due date is required'),
  category: z.string().min(1, 'Category is required'),
  note: z.string().max(300).optional(),
  durationType: z.enum(DURATION_TYPES),
  durationMonths: z.number().int().min(1).max(600).optional(),
}).superRefine((data, ctx) => {
  if (data.amountType === 'fixed' && data.amount <= 0) {
    ctx.addIssue({ code: 'custom', path: ['amount'], message: 'Amount must be positive' })
  }
  if (data.amountType === 'percent' && (!data.percentOfIncome || data.percentOfIncome <= 0)) {
    ctx.addIssue({ code: 'custom', path: ['percentOfIncome'], message: 'Percentage must be greater than 0' })
  }
  if (data.durationType === 'months' && !data.durationMonths) {
    ctx.addIssue({ code: 'custom', path: ['durationMonths'], message: 'Enter number of months' })
  }
})

export type BillInput = z.infer<typeof billSchema>
