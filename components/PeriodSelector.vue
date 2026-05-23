<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div class="inline-flex flex-wrap gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
      <button
        v-for="opt in options"
        :key="opt.value"
        class="rounded-md px-3 py-1.5 text-sm font-medium transition"
        :class="modelValue === opt.value
          ? 'bg-white text-primary shadow-sm dark:bg-gray-800'
          : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'"
        @click="$emit('update:modelValue', opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>

    <div v-if="modelValue === 'custom'" class="flex items-center gap-2">
      <input
        :value="from"
        type="date"
        class="input w-auto py-1.5"
        @input="$emit('update:from', ($event.target as HTMLInputElement).value)"
      />
      <span class="text-gray-400">—</span>
      <input
        :value="to"
        type="date"
        class="input w-auto py-1.5"
        @input="$emit('update:to', ($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string; from: string; to: string }>()
defineEmits<{
  'update:modelValue': [string]
  'update:from': [string]
  'update:to': [string]
}>()

const options = [
  { value: 'month', label: 'Bulan Ini' },
  { value: 'year', label: 'Tahun Ini' },
  { value: 'all', label: 'Semua' },
  { value: 'custom', label: 'Kustom' },
]
</script>
