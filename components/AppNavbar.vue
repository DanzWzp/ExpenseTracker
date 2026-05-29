<template>
  <header class="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-gray-200 bg-white/80 px-4 backdrop-blur dark:border-gray-700 dark:bg-gray-800/80 lg:px-6">
    <!-- Tombol menu (mobile) -->
    <button class="btn-ghost -ml-2 p-2 lg:hidden" aria-label="Buka menu" @click="$emit('toggle-sidebar')">
      <Bars3Icon class="h-6 w-6" />
    </button>

    <h1 class="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">{{ pageTitle }}</h1>

    <div class="ml-auto flex items-center gap-1 sm:gap-2">
      <!-- Tombol install PWA (muncul saat browser menawarkan instalasi) -->
      <button
        v-if="pwa?.showInstallPrompt && !pwa?.isPWAInstalled"
        class="btn-primary px-3 py-1.5 text-sm"
        @click="pwa?.install()"
      >
        <ArrowDownTrayIcon class="h-4 w-4" /> <span class="hidden sm:inline">Install App</span>
      </button>

      <!-- Toggle dark mode -->
      <button class="btn-ghost p-2" :aria-label="isDark ? 'Mode terang' : 'Mode gelap'" @click="toggle">
        <component :is="isDark ? SunIcon : MoonIcon" class="h-5 w-5" />
      </button>

      <!-- Avatar + nama -->
      <NuxtLink to="/profile" class="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-gray-100 dark:hover:bg-gray-700">
        <span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-600 dark:text-white">
          {{ initials }}
        </span>
        <span class="hidden text-sm font-medium text-gray-700 dark:text-gray-200 sm:inline">{{ displayName }}</span>
      </NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Bars3Icon, SunIcon, MoonIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline'

defineEmits<{ 'toggle-sidebar': [] }>()

// Integrasi PWA dari @vite-pwa/nuxt (undefined saat SSR / sebelum siap).
const pwa = useNuxtApp().$pwa

const route = useRoute()
const { displayName } = useAuth()
const { isDark, toggle } = useDarkMode()

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/expenses': 'Pengeluaran',
  '/recurring': 'Pengeluaran Berulang',
  '/budgets': 'Anggaran',
  '/goals': 'Target Keuangan',
  '/profile': 'Profil',
}

const pageTitle = computed(() => {
  const match = Object.keys(titles).find((k) => (k === '/' ? route.path === '/' : route.path.startsWith(k)))
  return match ? titles[match] : 'Expense Tracker'
})

const initials = computed(() =>
  displayName.value
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)
</script>
