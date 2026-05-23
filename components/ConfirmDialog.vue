<template>
  <BaseModal :model-value="modelValue" :title="title" @update:model-value="$emit('update:modelValue', $event)">
    <p class="text-sm text-gray-600 dark:text-gray-300">{{ message }}</p>
    <div class="mt-6 flex justify-end gap-2">
      <button class="btn-secondary" @click="$emit('update:modelValue', false)">Batal</button>
      <button class="btn-danger" :disabled="loading" @click="$emit('confirm')">
        <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        {{ confirmLabel }}
      </button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    message: string
    confirmLabel?: string
    loading?: boolean
  }>(),
  { title: 'Konfirmasi', confirmLabel: 'Hapus', loading: false },
)

defineEmits<{ 'update:modelValue': [boolean]; confirm: [] }>()
</script>
