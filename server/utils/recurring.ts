import { addWeeks, addMonths, addYears } from 'date-fns'
import { prisma } from './prisma'

/** Tambah satu siklus sesuai frekuensi. */
export function addFrequency(date: Date, frequency: string): Date {
  switch (frequency) {
    case 'Weekly':
      return addWeeks(date, 1)
    case 'Yearly':
      return addYears(date, 1)
    case 'Monthly':
    default:
      return addMonths(date, 1)
  }
}

/**
 * Buat otomatis expense yang sudah jatuh tempo dari semua recurring aktif milik user.
 * Idempoten: hanya membuat occurrence yang belum dibuat (berdasarkan lastGeneratedDate),
 * sampai hari ini (atau endDate bila lebih awal).
 */
export async function generateRecurringForUser(userId: string): Promise<number> {
  const now = new Date()
  const recurrings = await prisma.recurringExpense.findMany({
    where: { userId, isActive: true },
  })

  let createdTotal = 0

  for (const r of recurrings) {
    // Mulai dari occurrence setelah yang terakhir dibuat, atau dari startDate.
    let cursor = r.lastGeneratedDate ? addFrequency(r.lastGeneratedDate, r.frequency) : new Date(r.startDate)

    const limit = r.endDate && r.endDate < now ? r.endDate : now
    const toCreate: {
      userId: string
      amount: typeof r.amount
      category: string
      description: string | null
      date: Date
      paymentMethod: string
      recurringExpenseId: string
    }[] = []
    let lastDate: Date | null = r.lastGeneratedDate

    // Batas keamanan agar tidak loop tak terbatas.
    let guard = 0
    while (cursor <= limit && guard < 1000) {
      toCreate.push({
        userId,
        amount: r.amount,
        category: r.category,
        description: r.description,
        date: new Date(cursor),
        paymentMethod: r.paymentMethod,
        recurringExpenseId: r.id,
      })
      lastDate = new Date(cursor)
      cursor = addFrequency(cursor, r.frequency)
      guard++
    }

    if (toCreate.length > 0) {
      await prisma.expense.createMany({ data: toCreate })
      await prisma.recurringExpense.update({
        where: { id: r.id },
        data: { lastGeneratedDate: lastDate },
      })
      createdTotal += toCreate.length
    }
  }

  return createdTotal
}
