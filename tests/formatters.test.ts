import { describe, it, expect } from 'vitest'
import { formatNumber, formatCurrency, toDateInput, formatDate, formatMonthYear } from '../utils/formatters'

describe('formatNumber', () => {
  it('memberi pemisah ribuan gaya Indonesia', () => {
    expect(formatNumber(15000)).toBe('15.000')
    expect(formatNumber(1000000)).toBe('1.000.000')
  })

  it('menangani string dan input tak valid', () => {
    expect(formatNumber('2500')).toBe('2.500')
    expect(formatNumber('abc')).toBe('0')
  })
})

describe('formatCurrency', () => {
  it('memuat simbol Rp dan angka terformat', () => {
    const out = formatCurrency(15000)
    expect(out).toMatch(/Rp/)
    expect(out).toContain('15.000')
  })

  it('tidak menampilkan desimal', () => {
    expect(formatCurrency(15000.99)).not.toContain(',')
  })
})

describe('toDateInput', () => {
  it('mengubah Date menjadi yyyy-MM-dd', () => {
    expect(toDateInput(new Date(2026, 4, 23))).toBe('2026-05-23')
    expect(toDateInput(new Date(2026, 0, 1))).toBe('2026-01-01')
  })
})

describe('formatDate', () => {
  it('memformat tanggal dengan bulan Bahasa Indonesia', () => {
    expect(formatDate(new Date(2026, 4, 23))).toBe('23 Mei 2026')
  })
})

describe('formatMonthYear', () => {
  it('memformat bulan & tahun penuh', () => {
    expect(formatMonthYear(5, 2026)).toBe('Mei 2026')
    expect(formatMonthYear(1, 2025)).toBe('Januari 2025')
  })
})
