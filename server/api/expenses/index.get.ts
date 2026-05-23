import type { Prisma } from '@prisma/client'
import { requireUser } from '~/server/utils/auth'
import { prisma } from '~/server/utils/prisma'
import { serializeExpense } from '~/server/utils/serialize'

const SORTABLE = ['date', 'amount', 'category', 'paymentMethod', 'createdAt'] as const
const PAGE_SIZES = [10, 25, 50]

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const q = getQuery(event)

  const page = Math.max(1, Number(q.page) || 1)
  let pageSize = Number(q.pageSize) || 10
  if (!PAGE_SIZES.includes(pageSize)) pageSize = 10

  const sortByRaw = String(q.sortBy || 'date')
  const sortBy = (SORTABLE as readonly string[]).includes(sortByRaw) ? sortByRaw : 'date'
  const sortDir = String(q.sortDir) === 'asc' ? 'asc' : 'desc'

  // Bangun filter
  const where: Prisma.ExpenseWhereInput = { userId: user.id }

  if (q.category && q.category !== 'all') where.category = String(q.category)
  if (q.paymentMethod && q.paymentMethod !== 'all') where.paymentMethod = String(q.paymentMethod)
  if (q.search) {
    where.description = { contains: String(q.search), mode: 'insensitive' }
  }
  if (q.dateFrom || q.dateTo) {
    where.date = {}
    if (q.dateFrom) where.date.gte = new Date(String(q.dateFrom))
    if (q.dateTo) {
      const to = new Date(String(q.dateTo))
      to.setHours(23, 59, 59, 999)
      where.date.lte = to
    }
  }

  const [items, total, sumAgg] = await Promise.all([
    prisma.expense.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.expense.count({ where }),
    prisma.expense.aggregate({ where, _sum: { amount: true } }),
  ])

  return {
    data: items.map(serializeExpense),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    filteredSum: Number(sumAgg._sum.amount ?? 0),
  }
})
