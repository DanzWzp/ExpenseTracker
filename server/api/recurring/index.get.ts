import { requireUser } from '~/server/utils/auth'
import { prisma } from '~/server/utils/prisma'
import { serializeRecurring } from '~/server/utils/serialize'
import { addFrequency } from '~/server/utils/recurring'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)

  const list = await prisma.recurringExpense.findMany({
    where: { userId: user.id },
    orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
  })

  return list.map((r) => {
    const nextDue = r.lastGeneratedDate ? addFrequency(r.lastGeneratedDate, r.frequency) : new Date(r.startDate)
    const ended = r.endDate ? nextDue > r.endDate : false
    return {
      ...serializeRecurring(r),
      nextDue: r.isActive && !ended ? nextDue.toISOString() : null,
    }
  })
})
