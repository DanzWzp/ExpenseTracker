import { requireUser } from '~/server/utils/auth'
import { prisma } from '~/server/utils/prisma'
import { serializeRecurring } from '~/server/utils/serialize'
import { recurringSchema } from '~/utils/validators'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)

  const parsed = recurringSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Data tidak valid',
      data: parsed.error.flatten().fieldErrors,
    })
  }

  const { amount, category, description, paymentMethod, frequency, startDate, endDate } = parsed.data

  const recurring = await prisma.recurringExpense.create({
    data: {
      userId: user.id,
      amount,
      category,
      description: description || null,
      paymentMethod,
      frequency,
      startDate,
      endDate: endDate ?? null,
      isActive: true,
    },
  })

  return serializeRecurring(recurring)
})
