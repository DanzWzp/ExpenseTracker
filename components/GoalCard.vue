<template>
  <div class="card" :class="goal.isCompleted ? 'ring-1 ring-success' : ''">
    <div class="mb-2 flex items-start justify-between gap-2">
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <h4 class="truncate font-semibold text-gray-900 dark:text-white">{{ goal.name }}</h4>
          <span v-if="goal.isCompleted" class="badge bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">✓ Tercapai</span>
        </div>
        <p v-if="goal.description" class="mt-0.5 truncate text-xs text-gray-500">{{ goal.description }}</p>
      </div>
      <div class="flex shrink-0 gap-1">
        <button class="btn-ghost p-1.5" title="Edit" @click="$emit('edit', goal)"><PencilSquareIcon class="h-4 w-4" /></button>
        <button class="btn-ghost p-1.5 text-danger" title="Hapus" @click="$emit('delete', goal)"><TrashIcon class="h-4 w-4" /></button>
      </div>
    </div>

    <div class="mb-1 flex items-baseline justify-between">
      <span class="text-lg font-bold text-gray-900 dark:text-white">{{ formatCurrency(goal.currentAmount) }}</span>
      <span class="text-sm text-gray-500">/ {{ formatCurrency(goal.targetAmount) }}</span>
    </div>

    <div class="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
      <div class="h-full rounded-full bg-primary transition-all" :class="goal.isCompleted ? '!bg-success' : ''" :style="{ width: percentage + '%' }" />
    </div>

    <div class="mt-2 flex items-center justify-between text-xs">
      <span class="text-gray-500">{{ percentage }}%</span>
      <span :class="deadlineClass">{{ deadlineText }}</span>
    </div>

    <button v-if="!goal.isCompleted" class="btn-secondary mt-3 w-full" @click="$emit('add', goal)">
      <PlusIcon class="h-4 w-4" /> Tambah Tabungan
    </button>
  </div>
</template>

<script setup lang="ts">
import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/vue/24/outline'
import { differenceInCalendarDays } from 'date-fns'
import type { Goal } from '~/types/models'
import { formatCurrency, formatDate } from '~/utils/formatters'

const props = defineProps<{ goal: Goal }>()
defineEmits<{ edit: [Goal]; delete: [Goal]; add: [Goal] }>()

const percentage = computed(() => {
  if (props.goal.targetAmount <= 0) return 0
  return Math.min(Math.round((props.goal.currentAmount / props.goal.targetAmount) * 100), 100)
})

const daysLeft = computed(() => differenceInCalendarDays(new Date(props.goal.deadline), new Date()))

const deadlineText = computed(() => {
  if (props.goal.isCompleted) return `Selesai`
  if (daysLeft.value < 0) return `Lewat tenggat (${formatDate(props.goal.deadline)})`
  if (daysLeft.value === 0) return 'Tenggat hari ini'
  return `${daysLeft.value} hari lagi`
})

const deadlineClass = computed(() => {
  if (props.goal.isCompleted) return 'text-success font-medium'
  if (daysLeft.value < 0) return 'text-danger font-medium'
  if (daysLeft.value <= 7) return 'text-warning font-medium'
  return 'text-gray-500'
})
</script>
