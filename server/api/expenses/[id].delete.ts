import { requireUser } from '~/server/utils/auth'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')

  const existing = await prisma.expense.findFirst({ where: { id, userId: user.id } })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Pengeluaran tidak ditemukan' })
  }

  await prisma.expense.delete({ where: { id } })
  return { success: true, id }
})
