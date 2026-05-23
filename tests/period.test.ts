import { describe, it, expect } from 'vitest'
import { periodRange, periodLabel } from '../server/utils/period'

describe('periodRange', () => {
  it("'all' mengembalikan rentang kosong", () => {
    expect(periodRange('all')).toEqual({})
  })

  it("'month' mulai dari tanggal 1 bulan ini", () => {
    const r = periodRange('month')
    const now = new Date()
    expect(r.gte?.getDate()).toBe(1)
    expect(r.gte?.getMonth()).toBe(now.getMonth())
    expect(r.gte?.getFullYear()).toBe(now.getFullYear())
    // batas atas eksklusif harus setelah batas bawah
    expect(r.lt!.getTime()).toBeGreaterThan(r.gte!.getTime())
  })

  it("'year' mulai 1 Januari tahun ini", () => {
    const r = periodRange('year')
    expect(r.gte?.getMonth()).toBe(0)
    expect(r.gte?.getDate()).toBe(1)
    expect(r.gte?.getFullYear()).toBe(new Date().getFullYear())
  })

  it("'custom' menghormati from & to (to inklusif akhir hari)", () => {
    const r = periodRange('custom', '2026-01-01', '2026-01-31')
    expect(r.gte).toBeInstanceOf(Date)
    expect(r.lte).toBeInstanceOf(Date)
    expect(r.lte?.getHours()).toBe(23)
    expect(r.lte?.getMinutes()).toBe(59)
  })

  it('default (tanpa argumen) sama dengan bulan ini', () => {
    expect(periodRange().gte?.getDate()).toBe(1)
  })
})

describe('periodLabel', () => {
  it('memberi label Bahasa Indonesia', () => {
    expect(periodLabel('year')).toBe('Tahun Ini')
    expect(periodLabel('all')).toBe('Semua Waktu')
    expect(periodLabel('custom')).toBe('Rentang Kustom')
    expect(periodLabel(undefined)).toBe('Bulan Ini')
  })
})
