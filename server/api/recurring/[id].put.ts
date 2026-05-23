import { z } from 'zod'
import { requireUser } from '~/server/utils/auth'
import { prisma } from '~/server/utils/prisma'
import { serializeRecurring } from '~/server/utils/serialize'
import { CATEGORY_VALUES, PAYMENT_VALUES, FREQUENCY_VALUES } from '~/utils/constants'

const schema = z.object({
  amount: z.coerce.number().positive().optional(),
  category: z.enum(CATEGORY_VALUES as [string, ...string[]]).optional(),
  description: z.string().max(500).optional().nullable(),
  paymentMethod: z.enum(PAYMENT_VALUES as [string, ...string[]]).optional(),
  frequency: z.enum(FREQUENCY_VALUES as [string, ...string[]]).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 422, statusMessage: 'Data tidak valid', data: parsed.error.flatten().fieldErrors })
  }

  const existing = await prisma.recurringExpense.findFirst({ where: { id, userId: user.id } })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Pengeluaran berulang tidak ditemukan' })
  }

  const d = parsed.data
  const updated = await prisma.recurringExpense.update({
    where: { id },
    data: {
      ...(d.amount !== undefined ? { amount: d.amount } : {}),
      ...(d.category !== undefined ? { category: d.category } : {}),
      ...(d.description !== undefined ? { description: d.description || null } : {}),
      ...(d.paymentMethod !== undefined ? { paymentMethod: d.paymentMethod } : {}),
      ...(d.frequency !== undefined ? { frequency: d.frequency } : {}),
      ...(d.startDate !== undefined ? { startDate: d.startDate } : {}),
      ...(d.endDate !== undefined ? { endDate: d.endDate } : {}),
      ...(d.isActive !== undefined ? { isActive: d.isActive } : {}),
    },
  })

  return serializeRecurring(updated)
})
