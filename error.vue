<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center dark:bg-gray-900">
    <p class="text-6xl font-bold text-primary">{{ error?.statusCode || 500 }}</p>
    <h1 class="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
      {{ error?.statusCode === 404 ? 'Halaman tidak ditemukan' : 'Terjadi kesalahan' }}
    </h1>
    <p class="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
      {{ error?.statusMessage || 'Maaf, sesuatu tidak berjalan semestinya.' }}
    </p>
    <button class="btn-primary mt-6" @click="handleError">Kembali ke Beranda</button>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{ error: NuxtError }>()

function handleError() {
  clearError({ redirect: '/' })
}
</script>
