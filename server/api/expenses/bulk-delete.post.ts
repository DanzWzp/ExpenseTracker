import { z } from 'zod'
import { requireUser } from '~/server/utils/auth'
import { prisma } from '~/server/utils/prisma'

const schema = z.object({ ids: z.array(z.string()).min(1, 'Tidak ada item dipilih') })

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 422, statusMessage: 'Daftar id tidak valid' })
  }

  // Hapus hanya milik user ini (proteksi data antar-user).
  const result = await prisma.expense.deleteMany({
    where: { id: { in: parsed.data.ids }, userId: user.id },
  })

  return { success: true, deleted: result.count }
})
