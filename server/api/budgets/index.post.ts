import { requireUser } from '~/server/utils/auth'
import { prisma } from '~/server/utils/prisma'
import { serializeBudget } from '~/server/utils/serialize'
import { budgetSchema } from '~/utils/validators'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)

  const parsed = budgetSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Data tidak valid',
      data: parsed.error.flatten().fieldErrors,
    })
  }

  const { category, monthlyLimit, currentMonth, currentYear } = parsed.data

  // Upsert: satu anggaran per (user, kategori, bulan, tahun).
  const budget = await prisma.budget.upsert({
    where: {
      userId_category_currentMonth_currentYear: {
        userId: user.id,
        category,
        currentMonth,
        currentYear,
      },
    },
    update: { monthlyLimit },
    create: { userId: user.id, category, monthlyLimit, currentMonth, currentYear },
  })

  return serializeBudget(budget)
})
