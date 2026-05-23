import { requireUser } from '~/server/utils/auth'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')

  const existing = await prisma.recurringExpense.findFirst({ where: { id, userId: user.id } })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Pengeluaran berulang tidak ditemukan' })
  }

  // Expense yang sudah ter-generate tetap ada (recurringExpenseId di-set NULL via skema).
  await prisma.recurringExpense.delete({ where: { id } })
  return { success: true, id }
})
