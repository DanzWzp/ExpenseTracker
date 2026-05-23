import { format, formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

/** Format angka menjadi mata uang Rupiah, mis. 15000 → "Rp 15.000". */
export function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(num)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

/** Format angka biasa dengan pemisah ribuan, mis. 15000 → "15.000". */
export function formatNumber(value: number | string): string {
  const num = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(num)) return '0'
  return new Intl.NumberFormat('id-ID').format(num)
}

/** Format tanggal panjang, mis. "23 Mei 2026". */
export function formatDate(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value
  return format(d, 'd MMM yyyy', { locale: idLocale })
}

/** Format tanggal pendek untuk input <input type="date">, mis. "2026-05-23". */
export function toDateInput(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value
  return format(d, 'yyyy-MM-dd')
}

/** Format bulan & tahun, mis. (5, 2026) → "Mei 2026". */
export function formatMonthYear(month: number, year: number): string {
  return format(new Date(year, month - 1, 1), 'MMMM yyyy', { locale: idLocale })
}

/** Jarak waktu relatif, mis. "3 hari lalu". */
export function formatRelative(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value
  return formatDistanceToNow(d, { addSuffix: true, locale: idLocale })
}
