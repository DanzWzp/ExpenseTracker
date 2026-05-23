import { format, startOfDay, subDays, startOfMonth, subMonths, isSameDay, isSameMonth } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { requireUser } from '~/server/utils/auth'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const now = new Date()

  const dailyStart = startOfDay(subDays(now, 29)) // 30 hari terakhir
  const monthlyStart = startOfMonth(subMonths(now, 11)) // 12 bulan terakhir

  // Ambil hanya tanggal & jumlah pada jendela terlama (12 bulan) — cukup untuk keduanya.
  const rows = await prisma.expense.findMany({
    where: { userId: user.id, date: { gte: monthlyStart } },
    select: { date: true, amount: true },
  })

  // Bucket harian (30 hari)
  const daily = Array.from({ length: 30 }, (_, i) => {
    const day = subDays(now, 29 - i)
    const total = rows
      .filter((r) => r.date >= dailyStart && isSameDay(r.date, day))
      .reduce((acc, r) => acc + Number(r.amount), 0)
    return { label: format(day, 'd MMM', { locale: idLocale }), total }
  })

  // Bucket bulanan (12 bulan)
  const monthly = Array.from({ length: 12 }, (_, i) => {
    const month = subMonths(now, 11 - i)
    const total = rows
      .filter((r) => isSameMonth(r.date, month))
      .reduce((acc, r) => acc + Number(r.amount), 0)
    return { label: format(month, 'MMM yy', { locale: idLocale }), total }
  })

  return { daily, monthly }
})
