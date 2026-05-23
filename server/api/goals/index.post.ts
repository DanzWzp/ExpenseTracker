import { requireUser } from '~/server/utils/auth'
import { prisma } from '~/server/utils/prisma'
import { serializeGoal } from '~/server/utils/serialize'
import { goalSchema } from '~/utils/validators'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)

  const parsed = goalSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Data tidak valid',
      data: parsed.error.flatten().fieldErrors,
    })
  }

  const { name, targetAmount, currentAmount, deadline, description } = parsed.data
  const current = currentAmount ?? 0
  const completed = current >= targetAmount

  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      name,
      targetAmount,
      currentAmount: current,
      deadline,
      description: description || null,
      isCompleted: completed,
      completedAt: completed ? new Date() : null,
    },
  })

  return serializeGoal(goal)
})
