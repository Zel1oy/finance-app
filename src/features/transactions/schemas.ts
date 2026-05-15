import { z } from 'zod'

export const TRANSACTION_TYPES = ['expense', 'income'] as const

export const transactionSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required').max(100, 'Max 100 characters'),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(TRANSACTION_TYPES),
  category: z.string().min(1, 'Category is required'),
  currency: z.string().min(1, 'Currency is required'),
  note: z.string().max(500, 'Max 500 characters').optional(),
})

export type TransactionInput = z.infer<typeof transactionSchema>
