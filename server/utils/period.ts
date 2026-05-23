// Hitung rentang tanggal dari parameter periode untuk filter analytics.
// period: 'month' | 'year' | 'all' | 'custom'

export interface DateRange {
  gte?: Date
  lt?: Date
  lte?: Date
}

export function periodRange(period?: string, from?: string, to?: string): DateRange {
  const now = new Date()

  switch (period) {
    case 'year':
      return {
        gte: new Date(now.getFullYear(), 0, 1),
        lt: new Date(now.getFullYear() + 1, 0, 1),
      }
    case 'all':
      return {}
    case 'custom': {
      const range: DateRange = {}
      if (from) range.gte = new Date(from)
      if (to) {
        const t = new Date(to)
        t.setHours(23, 59, 59, 999)
        range.lte = t
      }
      return range
    }
    case 'month':
    default:
      return {
        gte: new Date(now.getFullYear(), now.getMonth(), 1),
        lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      }
  }
}

/** Label periode (Bahasa Indonesia) untuk judul/UI. */
export function periodLabel(period?: string): string {
  switch (period) {
    case 'year':
      return 'Tahun Ini'
    case 'all':
      return 'Semua Waktu'
    case 'custom':
      return 'Rentang Kustom'
    case 'month':
    default:
      return 'Bulan Ini'
  }
}
