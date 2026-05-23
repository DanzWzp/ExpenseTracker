import { requireUser } from '~/server/utils/auth'
import { prisma } from '~/server/utils/prisma'
import { serializeGoal } from '~/server/utils/serialize'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)

  const goals = await prisma.goal.findMany({
    where: { userId: user.id },
    orderBy: [{ isCompleted: 'asc' }, { deadline: 'asc' }],
  })

  return goals.map(serializeGoal)
})
