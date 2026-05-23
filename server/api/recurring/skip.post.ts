import { z } from 'zod'
import { requireUser } from '~/server/utils/auth'
import { prisma } from '~/server/utils/prisma'
import { serializeRecurring } from '~/server/utils/serialize'
import { addFrequency } from '~/server/utils/recurring'

const schema = z.object({ id: z.string() })

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 422, statusMessage: 'ID tidak valid' })
  }

  const r = await prisma.recurringExpense.findFirst({ where: { id: parsed.data.id, userId: user.id } })
  if (!r) {
    throw createError({ statusCode: 404, statusMessage: 'Pengeluaran berulang tidak ditemukan' })
  }

  // Lewati satu siklus: majukan lastGeneratedDate satu periode tanpa membuat expense.
  const base = r.lastGeneratedDate ?? new Date(r.startDate)
  const skipped = addFrequency(base, r.frequency)

  const updated = await prisma.recurringExpense.update({
    where: { id: r.id },
    data: { lastGeneratedDate: skipped },
  })

  return serializeRecurring(updated)
})
