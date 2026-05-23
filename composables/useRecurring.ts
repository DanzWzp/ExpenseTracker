import { ref } from 'vue'
import type { RecurringExpense } from '~/types/models'

export interface RecurringInput {
  amount: number
  category: string
  description?: string
  paymentMethod: string
  frequency: string
  startDate: string
  endDate?: string | null
}

export function useRecurring() {
  const items = ref<RecurringExpense[]>([])
  const loading = ref(false)
  const error = ref('')

  async function fetchRecurring() {
    loading.value = true
    error.value = ''
    try {
      items.value = await $fetch<RecurringExpense[]>('/api/recurring')
    } catch (e: unknown) {
      error.value = (e as { statusMessage?: string })?.statusMessage || 'Gagal memuat pengeluaran berulang'
    } finally {
      loading.value = false
    }
  }

  async function createRecurring(payload: RecurringInput) {
    return await $fetch<RecurringExpense>('/api/recurring', { method: 'POST', body: payload })
  }

  async function updateRecurring(id: string, payload: Partial<RecurringInput> & { isActive?: boolean }) {
    return await $fetch<RecurringExpense>(`/api/recurring/${id}`, { method: 'PUT', body: payload })
  }

  async function toggleActive(r: RecurringExpense) {
    return await updateRecurring(r.id, { isActive: !r.isActive })
  }

  async function skipNext(id: string) {
    return await $fetch<RecurringExpense>('/api/recurring/skip', { method: 'POST', body: { id } })
  }

  async function deleteRecurring(id: string) {
    return await $fetch(`/api/recurring/${id}`, { method: 'DELETE' })
  }

  async function generate() {
    return await $fetch<{ success: boolean; created: number }>('/api/recurring/generate', { method: 'POST' })
  }

  return {
    items,
    loading,
    error,
    fetchRecurring,
    createRecurring,
    updateRecurring,
    toggleActive,
    skipNext,
    deleteRecurring,
    generate,
  }
}
