<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
        @click.self="close"
      >
        <div
          ref="dialogEl"
          class="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl outline-none dark:bg-gray-800 sm:max-w-lg sm:rounded-2xl"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          tabindex="-1"
        >
          <div class="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ title }}</h3>
            <button class="btn-ghost p-1.5" aria-label="Tutup" @click="close">
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>
          <div class="p-5">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useScrollLock, onKeyStroke } from '@vueuse/core'

const props = defineProps<{ modelValue: boolean; title: string }>()
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()

const dialogEl = ref<HTMLElement | null>(null)
const isLocked = useScrollLock(import.meta.client ? document.body : null)

// Kunci scroll body & fokuskan dialog saat modal terbuka.
watch(
  () => props.modelValue,
  (open) => {
    if (import.meta.client) isLocked.value = open
    if (open) nextTick(() => dialogEl.value?.focus())
  },
  { immediate: true },
)

// Tutup dengan tombol Escape.
onKeyStroke('Escape', () => {
  if (props.modelValue) close()
})

function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
