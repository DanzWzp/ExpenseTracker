import { requireUser } from '~/server/utils/auth'
import { prisma } from '~/server/utils/prisma'
import { serializeExpense } from '~/server/utils/serialize'
import { expenseSchema } from '~/utils/validators'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)

  const parsed = expenseSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Data tidak valid',
      data: parsed.error.flatten().fieldErrors,
    })
  }

  const { amount, category, description, date, paymentMethod } = parsed.data

  const expense = await prisma.expense.create({
    data: {
      userId: user.id,
      amount,
      category,
      description: description || null,
      date,
      paymentMethod,
    },
  })

  return serializeExpense(expense)
})
