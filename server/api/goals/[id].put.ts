import { z } from 'zod'
import { requireUser } from '~/server/utils/auth'
import { prisma } from '~/server/utils/prisma'
import { serializeGoal } from '~/server/utils/serialize'

const schema = z.object({
  name: z.string().min(1).max(120).optional(),
  targetAmount: z.coerce.number().positive().optional(),
  currentAmount: z.coerce.number().min(0).optional(),
  deadline: z.coerce.date().optional(),
  description: z.string().max(500).optional().nullable(),
})

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 422, statusMessage: 'Data tidak valid', data: parsed.error.flatten().fieldErrors })
  }

  const existing = await prisma.goal.findFirst({ where: { id, userId: user.id } })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Target tidak ditemukan' })
  }

  const d = parsed.data
  const nextTarget = d.targetAmount ?? Number(existing.targetAmount)
  const nextCurrent = d.currentAmount ?? Number(existing.currentAmount)
  const completed = nextCurrent >= nextTarget

  const updated = await prisma.goal.update({
    where: { id },
    data: {
      ...(d.name !== undefined ? { name: d.name } : {}),
      ...(d.targetAmount !== undefined ? { targetAmount: d.targetAmount } : {}),
      ...(d.currentAmount !== undefined ? { currentAmount: d.currentAmount } : {}),
      ...(d.deadline !== undefined ? { deadline: d.deadline } : {}),
      ...(d.description !== undefined ? { description: d.description || null } : {}),
      isCompleted: completed,
      completedAt: completed ? existing.completedAt ?? new Date() : null,
    },
  })

  return serializeGoal(updated)
})
