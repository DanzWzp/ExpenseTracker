import { describe, it, expect } from 'vitest'
import { expenseSchema, budgetSchema, goalSchema, isValidEmail } from '../utils/validators'

describe('expenseSchema', () => {
  const valid = {
    amount: 15000,
    category: 'Food',
    description: 'Makan siang',
    date: '2026-05-23',
    paymentMethod: 'Cash',
  }

  it('menerima data valid', () => {
    expect(expenseSchema.safeParse(valid).success).toBe(true)
  })

  it('mengoreksi angka berupa string (coerce)', () => {
    const res = expenseSchema.safeParse({ ...valid, amount: '20000' })
    expect(res.success).toBe(true)
    if (res.success) expect(res.data.amount).toBe(20000)
  })

  it('menolak jumlah <= 0', () => {
    expect(expenseSchema.safeParse({ ...valid, amount: 0 }).success).toBe(false)
    expect(expenseSchema.safeParse({ ...valid, amount: -5 }).success).toBe(false)
  })

  it('menolak kategori tidak valid', () => {
    expect(expenseSchema.safeParse({ ...valid, category: 'Crypto' }).success).toBe(false)
  })

  it('menolak deskripsi > 500 karakter', () => {
    expect(expenseSchema.safeParse({ ...valid, description: 'a'.repeat(501) }).success).toBe(false)
  })

  it('memperbolehkan deskripsi kosong', () => {
    expect(expenseSchema.safeParse({ ...valid, description: '' }).success).toBe(true)
  })
})

describe('budgetSchema', () => {
  it('menerima anggaran valid', () => {
    const res = budgetSchema.safeParse({
      category: 'Food',
      monthlyLimit: 1000000,
      currentMonth: 5,
      currentYear: 2026,
    })
    expect(res.success).toBe(true)
  })

  it('menolak bulan di luar 1-12', () => {
    expect(
      budgetSchema.safeParse({ category: 'Food', monthlyLimit: 1000, currentMonth: 13, currentYear: 2026 }).success,
    ).toBe(false)
  })
})

describe('goalSchema', () => {
  it('menerima target valid', () => {
    expect(
      goalSchema.safeParse({ name: 'Dana darurat', targetAmount: 5000000, deadline: '2026-12-31' }).success,
    ).toBe(true)
  })

  it('menolak nama kosong', () => {
    expect(goalSchema.safeParse({ name: '', targetAmount: 100, deadline: '2026-12-31' }).success).toBe(false)
  })
})

describe('isValidEmail', () => {
  it('mengenali email valid & tidak valid', () => {
    expect(isValidEmail('aksara@email.com')).toBe(true)
    expect(isValidEmail('a.b@sub.domain.id')).toBe(true)
    expect(isValidEmail('bukan-email')).toBe(false)
    expect(isValidEmail('a@b')).toBe(false)
    expect(isValidEmail('')).toBe(false)
  })
})
