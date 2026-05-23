<template>
  <div class="card" :class="budget.exceeded ? 'ring-1 ring-danger' : ''">
    <div class="mb-3 flex items-start justify-between">
      <CategoryBadge :category="budget.category" />
      <div class="flex gap-1">
        <button class="btn-ghost p-1.5" title="Edit" @click="$emit('edit', budget)"><PencilSquareIcon class="h-4 w-4" /></button>
        <button class="btn-ghost p-1.5 text-danger" title="Hapus" @click="$emit('delete', budget)"><TrashIcon class="h-4 w-4" /></button>
      </div>
    </div>

    <div class="mb-1 flex items-baseline justify-between">
      <span class="text-lg font-bold text-gray-900 dark:text-white">{{ formatCurrency(budget.spent) }}</span>
      <span class="text-sm text-gray-500">/ {{ formatCurrency(budget.monthlyLimit) }}</span>
    </div>

    <div class="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
      <div class="h-full rounded-full transition-all" :class="barColor" :style="{ width: Math.min(budget.percentage, 100) + '%' }" />
    </div>

    <div class="mt-2 flex items-center justify-between text-xs">
      <span :class="budget.exceeded ? 'font-medium text-danger' : 'text-gray-500'">
        {{ budget.percentage }}% terpakai
      </span>
      <span v-if="budget.exceeded" class="font-medium text-danger">
        ⚠️ Lebih {{ formatCurrency(Math.abs(budget.remaining)) }}
      </span>
      <span v-else class="text-gray-500">Sisa {{ formatCurrency(budget.remaining) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'
import type { BudgetWithProgress } from '~/types/models'
import { formatCurrency } from '~/utils/formatters'

const props = defineProps<{ budget: BudgetWithProgress }>()
defineEmits<{ edit: [BudgetWithProgress]; delete: [BudgetWithProgress] }>()

const barColor = computed(() => {
  if (props.budget.percentage > 100) return 'bg-danger'
  if (props.budget.percentage >= 80) return 'bg-warning'
  return 'bg-success'
})
</script>
