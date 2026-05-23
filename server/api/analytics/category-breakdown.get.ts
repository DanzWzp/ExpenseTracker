import type { Prisma } from '@prisma/client'
import { requireUser } from '~/server/utils/auth'
import { prisma } from '~/server/utils/prisma'
import { periodRange } from '~/server/utils/period'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const q = getQuery(event)

  const range = periodRange(String(q.period || 'month'), q.from ? String(q.from) : undefined, q.to ? String(q.to) : undefined)

  const where: Prisma.ExpenseWhereInput = { userId: user.id }
  if (range.gte || range.lt || range.lte) {
    where.date = {}
    if (range.gte) where.date.gte = range.gte
    if (range.lt) where.date.lt = range.lt
    if (range.lte) where.date.lte = range.lte
  }

  const grouped = await prisma.expense.groupBy({
    by: ['category'],
    where,
    _sum: { amount: true },
    _count: true,
    orderBy: { _sum: { amount: 'desc' } },
  })

  const total = grouped.reduce((acc, g) => acc + Number(g._sum.amount ?? 0), 0)

  const byCategory = grouped.map((g) => {
    const sum = Number(g._sum.amount ?? 0)
    return {
      category: g.category,
      total: sum,
      count: g._count,
      percentage: total > 0 ? Math.round((sum / total) * 1000) / 10 : 0,
    }
  })

  return { total, byCategory }
})
