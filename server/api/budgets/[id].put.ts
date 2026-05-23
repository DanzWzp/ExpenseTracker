import { z } from 'zod'
import { requireUser } from '~/server/utils/auth'
import { prisma } from '~/server/utils/prisma'
import { serializeBudget } from '~/server/utils/serialize'

const schema = z.object({ monthlyLimit: z.coerce.number().positive('Batas harus lebih dari 0') })

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 422, statusMessage: 'Data tidak valid', data: parsed.error.flatten().fieldErrors })
  }

  const existing = await prisma.budget.findFirst({ where: { id, userId: user.id } })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Anggaran tidak ditemukan' })
  }

  const updated = await prisma.budget.update({
    where: { id },
    data: { monthlyLimit: parsed.data.monthlyLimit },
  })

  return serializeBudget(updated)
})
