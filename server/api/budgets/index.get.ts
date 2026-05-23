import { requireUser } from '~/server/utils/auth'
import { prisma } from '~/server/utils/prisma'
import { serializeBudget } from '~/server/utils/serialize'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const q = getQuery(event)
  const now = new Date()

  const month = Number(q.month) || now.getMonth() + 1
  const year = Number(q.year) || now.getFullYear()

  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 1)

  const [budgets, spentByCat] = await Promise.all([
    prisma.budget.findMany({
      where: { userId: user.id, currentMonth: month, currentYear: year },
      orderBy: { category: 'asc' },
    }),
    prisma.expense.groupBy({
      by: ['category'],
      where: { userId: user.id, date: { gte: start, lt: end } },
      _sum: { amount: true },
    }),
  ])

  const spentMap = new Map(spentByCat.map((s) => [s.category, Number(s._sum.amount ?? 0)]))

  const items = budgets.map((b) => {
    const limit = Number(b.monthlyLimit)
    const spent = spentMap.get(b.category) ?? 0
    return {
      ...serializeBudget(b),
      spent,
      remaining: limit - spent,
      percentage: limit > 0 ? Math.round((spent / limit) * 100) : 0,
      exceeded: spent > limit,
    }
  })

  const totalLimit = items.reduce((a, b) => a + b.monthlyLimit, 0)
  const totalSpent = items.reduce((a, b) => a + b.spent, 0)

  return { month, year, totalLimit, totalSpent, items }
})
