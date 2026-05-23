import { requireUser } from '~/server/utils/auth'
import { prisma } from '~/server/utils/prisma'
import { serializeExpense } from '~/server/utils/serialize'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const now = new Date()

  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const startYear = new Date(now.getFullYear(), 0, 1)
  const startNextYear = new Date(now.getFullYear() + 1, 0, 1)

  const [monthAgg, yearAgg, byCategory, recent, monthCount] = await Promise.all([
    prisma.expense.aggregate({
      where: { userId: user.id, date: { gte: startMonth, lt: startNextMonth } },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { userId: user.id, date: { gte: startYear, lt: startNextYear } },
      _sum: { amount: true },
    }),
    prisma.expense.groupBy({
      by: ['category'],
      where: { userId: user.id, date: { gte: startMonth, lt: startNextMonth } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
    }),
    prisma.expense.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: 5,
    }),
    prisma.expense.count({
      where: { userId: user.id, date: { gte: startMonth, lt: startNextMonth } },
    }),
  ])

  const monthTotal = Number(monthAgg._sum.amount ?? 0)
  const yearTotal = Number(yearAgg._sum.amount ?? 0)
  const daysElapsed = now.getDate()
  const avgDaily = daysElapsed > 0 ? monthTotal / daysElapsed : 0

  const breakdown = byCategory.map((b) => {
    const total = Number(b._sum.amount ?? 0)
    return {
      category: b.category,
      total,
      percentage: monthTotal > 0 ? Math.round((total / monthTotal) * 100) : 0,
    }
  })

  return {
    monthTotal,
    yearTotal,
    avgDaily,
    monthCount,
    topCategory: breakdown[0] ?? null,
    categoryBreakdown: breakdown.slice(0, 5),
    recent: recent.map(serializeExpense),
  }
})
