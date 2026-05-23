import { requireUser } from '~/server/utils/auth'
import { prisma } from '~/server/utils/prisma'
import { serializeExpense } from '~/server/utils/serialize'
import { expenseSchema } from '~/utils/validators'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const parsed = expenseSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Data tidak valid',
      data: parsed.error.flatten().fieldErrors,
    })
  }

  // Pastikan expense milik user ini.
  const existing = await prisma.expense.findFirst({ where: { id, userId: user.id } })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Pengeluaran tidak ditemukan' })
  }

  const { amount, category, description, date, paymentMethod } = parsed.data

  const updated = await prisma.expense.update({
    where: { id },
    data: { amount, category, description: description || null, date, paymentMethod },
  })

  return serializeExpense(updated)
})
