import { ref } from 'vue'
import type { Budget, BudgetListResponse } from '~/types/models'

export function useBudgets() {
  const now = new Date()
  const month = ref(now.getMonth() + 1)
  const year = ref(now.getFullYear())

  const data = ref<BudgetListResponse>({
    month: month.value,
    year: year.value,
    totalLimit: 0,
    totalSpent: 0,
    items: [],
  })
  const loading = ref(false)
  const error = ref('')

  async function fetchBudgets() {
    loading.value = true
    error.value = ''
    try {
      data.value = await $fetch<BudgetListResponse>('/api/budgets', {
        query: { month: month.value, year: year.value },
      })
    } catch (e: unknown) {
      error.value = (e as { statusMessage?: string })?.statusMessage || 'Gagal memuat anggaran'
    } finally {
      loading.value = false
    }
  }

  async function saveBudget(payload: {
    category: string
    monthlyLimit: number
  }) {
    return await $fetch<Budget>('/api/budgets', {
      method: 'POST',
      body: { ...payload, currentMonth: month.value, currentYear: year.value },
    })
  }

  async function updateBudget(id: string, monthlyLimit: number) {
    return await $fetch<Budget>(`/api/budgets/${id}`, { method: 'PUT', body: { monthlyLimit } })
  }

  async function deleteBudget(id: string) {
    return await $fetch(`/api/budgets/${id}`, { method: 'DELETE' })
  }

  return { month, year, data, loading, error, fetchBudgets, saveBudget, updateBudget, deleteBudget }
}
