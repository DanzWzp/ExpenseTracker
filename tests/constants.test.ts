import { describe, it, expect } from 'vitest'
import {
  CATEGORIES,
  CATEGORY_VALUES,
  PAYMENT_VALUES,
  categoryLabel,
  categoryDef,
  paymentLabel,
} from '../utils/constants'

describe('constants', () => {
  it('punya 7 kategori dan 4 metode pembayaran', () => {
    expect(CATEGORY_VALUES).toHaveLength(7)
    expect(PAYMENT_VALUES).toHaveLength(4)
    expect(CATEGORY_VALUES).toContain('Food')
    expect(CATEGORY_VALUES).toContain('Other')
  })

  it('categoryLabel menerjemahkan ke Bahasa Indonesia', () => {
    expect(categoryLabel('Food')).toBe('Makanan')
    expect(categoryLabel('Transport')).toBe('Transportasi')
  })

  it('categoryLabel mengembalikan nilai asli untuk kategori tak dikenal', () => {
    expect(categoryLabel('Unknown')).toBe('Unknown')
  })

  it('paymentLabel menerjemahkan metode pembayaran', () => {
    expect(paymentLabel('Cash')).toBe('Tunai')
    expect(paymentLabel('Credit Card')).toBe('Kartu Kredit')
  })

  it('categoryDef mengembalikan definisi lengkap & fallback ke Other', () => {
    expect(categoryDef('Food').emoji).toBe('🍔')
    expect(categoryDef('tidak-ada')).toBe(CATEGORIES[CATEGORIES.length - 1])
    expect(categoryDef('tidak-ada').label).toBe('Lainnya')
  })

  it('setiap kategori punya warna hex valid', () => {
    for (const c of CATEGORIES) {
      expect(c.hex).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })
})
