import { z } from 'zod'
import { CATEGORY_VALUES, PAYMENT_VALUES, FREQUENCY_VALUES } from './constants'

// Skema validasi bersama (dipakai di form frontend & API backend).

export const expenseSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: 'Jumlah harus berupa angka' })
    .positive('Jumlah harus lebih dari 0'),
  category: z.enum(CATEGORY_VALUES as [string, ...string[]], {
    errorMap: () => ({ message: 'Kategori tidak valid' }),
  }),
  description: z
    .string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional()
    .or(z.literal('')),
  date: z.coerce.date({ invalid_type_error: 'Tanggal tidak valid' }),
  paymentMethod: z.enum(PAYMENT_VALUES as [string, ...string[]], {
    errorMap: () => ({ message: 'Metode pembayaran tidak valid' }),
  }),
})

export type ExpenseInput = z.infer<typeof expenseSchema>

export const recurringSchema = z.object({
  amount: z.coerce.number().positive('Jumlah harus lebih dari 0'),
  category: z.enum(CATEGORY_VALUES as [string, ...string[]]),
  description: z.string().max(500).optional().or(z.literal('')),
  paymentMethod: z.enum(PAYMENT_VALUES as [string, ...string[]]),
  frequency: z.enum(FREQUENCY_VALUES as [string, ...string[]]),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
})

export const budgetSchema = z.object({
  category: z.enum(CATEGORY_VALUES as [string, ...string[]]),
  monthlyLimit: z.coerce.number().positive('Batas harus lebih dari 0'),
  currentMonth: z.coerce.number().int().min(1).max(12),
  currentYear: z.coerce.number().int().min(2000).max(2100),
})

export const goalSchema = z.object({
  name: z.string().min(1, 'Nama target wajib diisi').max(120),
  targetAmount: z.coerce.number().positive('Target harus lebih dari 0'),
  currentAmount: z.coerce.number().min(0).optional(),
  deadline: z.coerce.date(),
  description: z.string().max(500).optional().or(z.literal('')),
})

/** Validasi email sederhana untuk form auth. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
