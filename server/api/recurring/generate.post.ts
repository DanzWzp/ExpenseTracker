import { requireUser } from '~/server/utils/auth'
import { generateRecurringForUser } from '~/server/utils/recurring'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const created = await generateRecurringForUser(user.id)
  return { success: true, created }
})
