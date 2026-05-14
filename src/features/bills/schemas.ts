import { z } from 'zod'

export const FREQUENCIES = ['weekly', 'monthly', 'yearly'] as const
export const CATEGORIES_ARRAY = [
  'food', 'transport', 'entertainment', 'housing',
  'health', 'savings', 'income', 'other',
] as const

export const billSchema = z.object({
  name: z.string().min(1, 'Name is required').max(60),
  amount: z
    .number()
    .positive('Amount must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  frequency: z.enum(FREQUENCIES),
  nextDueDate: z.string().min(1, 'Due date is required'),
  category: z.enum(CATEGORIES_ARRAY),
  note: z.string().max(300).optional(),
})

export type BillInput = z.infer<typeof billSchema>
