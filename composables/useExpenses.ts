import { reactive, ref } from 'vue'
import type { Expense, ExpenseFormData, ExpenseListResponse, SortDir } from '~/types/models'
import { categoryLabel, paymentLabel } from '~/utils/constants'
import { formatDate } from '~/utils/formatters'

export interface ExpenseFilters {
  category: string
  paymentMethod: string
  search: string
  dateFrom: string
  dateTo: string
  sortBy: string
  sortDir: SortDir
  page: number
  pageSize: number
}

export function useExpenses() {
  const items = ref<Expense[]>([])
  const total = ref(0)
  const totalPages = ref(1)
  const filteredSum = ref(0)
  const loading = ref(false)
  const error = ref('')

  const filters = reactive<ExpenseFilters>({
    category: 'all',
    paymentMethod: 'all',
    search: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'date',
    sortDir: 'desc',
    page: 1,
    pageSize: 10,
  })

  async function fetchExpenses() {
    loading.value = true
    error.value = ''
    try {
      const res = await $fetch<ExpenseListResponse>('/api/expenses', {
        query: {
          category: filters.category,
          paymentMethod: filters.paymentMethod,
          search: filters.search || undefined,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
          sortBy: filters.sortBy,
          sortDir: filters.sortDir,
          page: filters.page,
          pageSize: filters.pageSize,
        },
      })
      items.value = res.data
      total.value = res.total
      totalPages.value = res.totalPages
      filteredSum.value = res.filteredSum
      // Koreksi bila halaman saat ini melebihi total halaman (mis. setelah hapus).
      if (filters.page > res.totalPages) {
        filters.page = res.totalPages
      }
    } catch (e: unknown) {
      error.value = (e as { statusMessage?: string })?.statusMessage || 'Gagal memuat data pengeluaran'
    } finally {
      loading.value = false
    }
  }

  async function createExpense(payload: ExpenseFormData) {
    return await $fetch<Expense>('/api/expenses', { method: 'POST', body: payload })
  }

  async function updateExpense(id: string, payload: ExpenseFormData) {
    return await $fetch<Expense>(`/api/expenses/${id}`, { method: 'PUT', body: payload })
  }

  async function deleteExpense(id: string) {
    return await $fetch(`/api/expenses/${id}`, { method: 'DELETE' })
  }

  async function bulkDelete(ids: string[]) {
    return await $fetch('/api/expenses/bulk-delete', { method: 'POST', body: { ids } })
  }

  /** Duplikat: buat expense baru dengan data sama (tanggal hari ini). */
  async function duplicateExpense(source: Expense) {
    return await createExpense({
      amount: source.amount,
      category: source.category,
      description: source.description || '',
      date: new Date().toISOString(),
      paymentMethod: source.paymentMethod,
    })
  }

  function toggleSort(column: string) {
    if (filters.sortBy === column) {
      filters.sortDir = filters.sortDir === 'asc' ? 'desc' : 'asc'
    } else {
      filters.sortBy = column
      filters.sortDir = 'desc'
    }
    filters.page = 1
  }

  /** Export SEMUA pengeluaran (sesuai filter) ke CSV, terlepas dari pagination. */
  async function exportCsv() {
    const res = await $fetch<ExpenseListResponse>('/api/expenses', {
      query: {
        category: filters.category,
        paymentMethod: filters.paymentMethod,
        search: filters.search || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        sortBy: filters.sortBy,
        sortDir: filters.sortDir,
        page: 1,
        pageSize: 50,
      },
    })

    // Ambil semua halaman bila lebih dari satu.
    const all: Expense[] = [...res.data]
    for (let p = 2; p <= res.totalPages; p++) {
      const more = await $fetch<ExpenseListResponse>('/api/expenses', {
        query: { ...toRawQuery(filters), page: p, pageSize: 50 },
      })
      all.push(...more.data)
    }

    const header = ['Tanggal', 'Kategori', 'Deskripsi', 'Jumlah', 'Metode Pembayaran']
    const rows = all.map((e) => [
      formatDate(e.date),
      categoryLabel(e.category),
      (e.description || '').replace(/"/g, '""'),
      String(e.amount),
      paymentLabel(e.paymentMethod),
    ])

    const csv = [header, ...rows]
      .map((r) => r.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pengeluaran-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function toRawQuery(f: ExpenseFilters) {
    return {
      category: f.category,
      paymentMethod: f.paymentMethod,
      search: f.search || undefined,
      dateFrom: f.dateFrom || undefined,
      dateTo: f.dateTo || undefined,
      sortBy: f.sortBy,
      sortDir: f.sortDir,
    }
  }

  return {
    items,
    total,
    totalPages,
    filteredSum,
    loading,
    error,
    filters,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    bulkDelete,
    duplicateExpense,
    toggleSort,
    exportCsv,
  }
}
