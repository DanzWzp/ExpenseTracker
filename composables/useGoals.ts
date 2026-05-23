import { ref } from 'vue'
import type { Goal } from '~/types/models'

export interface GoalInput {
  name: string
  targetAmount: number
  currentAmount?: number
  deadline: string
  description?: string
}

export function useGoals() {
  const items = ref<Goal[]>([])
  const loading = ref(false)
  const error = ref('')

  async function fetchGoals() {
    loading.value = true
    error.value = ''
    try {
      items.value = await $fetch<Goal[]>('/api/goals')
    } catch (e: unknown) {
      error.value = (e as { statusMessage?: string })?.statusMessage || 'Gagal memuat target'
    } finally {
      loading.value = false
    }
  }

  async function createGoal(payload: GoalInput) {
    return await $fetch<Goal>('/api/goals', { method: 'POST', body: payload })
  }

  async function updateGoal(id: string, payload: Partial<GoalInput>) {
    return await $fetch<Goal>(`/api/goals/${id}`, { method: 'PUT', body: payload })
  }

  async function addToGoal(goal: Goal, amount: number) {
    return await updateGoal(goal.id, { currentAmount: goal.currentAmount + amount })
  }

  async function deleteGoal(id: string) {
    return await $fetch(`/api/goals/${id}`, { method: 'DELETE' })
  }

  return { items, loading, error, fetchGoals, createGoal, updateGoal, addToGoal, deleteGoal }
}
