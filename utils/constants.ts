// Sumber tunggal untuk kategori & metode pembayaran.
// Nilai (value) disimpan dalam bahasa Inggris agar konsisten dengan skema DB,
// label ditampilkan dalam bahasa Indonesia.

export interface CategoryDef {
  value: string
  label: string
  /** kelas warna Tailwind untuk badge & chart */
  color: string
  /** warna hex untuk Chart.js */
  hex: string
  emoji: string
}

export const CATEGORIES: CategoryDef[] = [
  { value: 'Food', label: 'Makanan', color: 'bg-orange-100 text-orange-700', hex: '#F97316', emoji: '🍔' },
  { value: 'Transport', label: 'Transportasi', color: 'bg-blue-100 text-blue-700', hex: '#3B82F6', emoji: '🚗' },
  { value: 'Entertainment', label: 'Hiburan', color: 'bg-purple-100 text-purple-700', hex: '#A855F7', emoji: '🎬' },
  { value: 'Utilities', label: 'Tagihan', color: 'bg-cyan-100 text-cyan-700', hex: '#06B6D4', emoji: '💡' },
  { value: 'Health', label: 'Kesehatan', color: 'bg-green-100 text-green-700', hex: '#10B981', emoji: '🏥' },
  { value: 'Shopping', label: 'Belanja', color: 'bg-pink-100 text-pink-700', hex: '#EC4899', emoji: '🛍️' },
  { value: 'Other', label: 'Lainnya', color: 'bg-gray-100 text-gray-700', hex: '#6B7280', emoji: '📦' },
]

export const CATEGORY_VALUES = CATEGORIES.map((c) => c.value)

export function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value
}

export function categoryDef(value: string): CategoryDef {
  return CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1]
}

export interface PaymentDef {
  value: string
  label: string
}

export const PAYMENT_METHODS: PaymentDef[] = [
  { value: 'Cash', label: 'Tunai' },
  { value: 'Credit Card', label: 'Kartu Kredit' },
  { value: 'Debit Card', label: 'Kartu Debit' },
  { value: 'Online Transfer', label: 'Transfer Online' },
]

export const PAYMENT_VALUES = PAYMENT_METHODS.map((p) => p.value)

export function paymentLabel(value: string): string {
  return PAYMENT_METHODS.find((p) => p.value === value)?.label ?? value
}

export const RECURRING_FREQUENCIES = [
  { value: 'Weekly', label: 'Mingguan' },
  { value: 'Monthly', label: 'Bulanan' },
  { value: 'Yearly', label: 'Tahunan' },
]

export const FREQUENCY_VALUES = RECURRING_FREQUENCIES.map((f) => f.value)
