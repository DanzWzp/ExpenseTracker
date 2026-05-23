import type { Expense, Budget, Goal, RecurringExpense } from '@prisma/client'

// Prisma mengembalikan Decimal; ubah ke number agar mudah dipakai di frontend.

export function serializeExpense(e: Expense) {
  return { ...e, amount: Number(e.amount) }
}

export function serializeBudget(b: Budget) {
  return { ...b, monthlyLimit: Number(b.monthlyLimit) }
}

export function serializeGoal(g: Goal) {
  return {
    ...g,
    targetAmount: Number(g.targetAmount),
    currentAmount: Number(g.currentAmount),
  }
}

export function serializeRecurring(r: RecurringExpense) {
  return { ...r, amount: Number(r.amount) }
}
