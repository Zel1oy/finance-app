import { z } from 'zod'

export const goalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(60),
  targetAmount: z
    .number()
    .positive('Target must be positive'),
  currentAmount: z
    .number()
    .min(0, 'Cannot be negative'),
  currency: z.string().min(1, 'Currency is required'),
  targetDate: z.string().min(1, 'Target date is required'),
})

export type GoalInput = z.infer<typeof goalSchema>

export const contributeSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be positive'),
})

export type ContributeInput = z.infer<typeof contributeSchema>
