<template>
  <div class="card flex items-center gap-4">
    <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl" :class="iconBg">
      <slot name="icon">{{ emoji }}</slot>
    </div>
    <div class="min-w-0">
      <p class="truncate text-sm text-gray-500 dark:text-gray-400">{{ title }}</p>
      <p class="truncate text-xl font-bold text-gray-900 dark:text-white">{{ value }}</p>
      <p v-if="subtitle" class="truncate text-xs text-gray-400">{{ subtitle }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    value: string
    subtitle?: string
    emoji?: string
    iconBg?: string
  }>(),
  { subtitle: '', emoji: '💰', iconBg: 'bg-primary-100 text-primary-700 dark:bg-primary-600/30 dark:text-primary-200' },
)
</script>
