<template>
  <nav class="flex h-full flex-col bg-white dark:bg-gray-800">
    <NuxtLink to="/" class="flex items-center gap-2.5 px-5 py-5" @click="$emit('navigate')">
      <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-lg text-white shadow">💰</span>
      <span class="text-lg font-bold text-gray-900 dark:text-white">Expense Tracker</span>
    </NuxtLink>

    <ul class="flex-1 space-y-1 px-3">
      <li v-for="item in navItems" :key="item.to">
        <NuxtLink
          :to="item.to"
          class="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition"
          :class="isActive(item.to)
            ? 'bg-primary text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'"
          @click="$emit('navigate')"
        >
          <component :is="item.icon" class="h-5 w-5 shrink-0" />
          {{ item.label }}
        </NuxtLink>
      </li>
    </ul>

    <div class="border-t border-gray-200 p-3 dark:border-gray-700">
      <button class="btn-ghost w-full justify-start" @click="onLogout">
        <ArrowRightOnRectangleIcon class="h-5 w-5" />
        Keluar
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import {
  HomeIcon,
  BanknotesIcon,
  ArrowPathIcon,
  ChartPieIcon,
  FlagIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/outline'

defineEmits<{ navigate: [] }>()

const route = useRoute()
const router = useRouter()
const { logout } = useAuth()
const toast = useToast()

const navItems = [
  { label: 'Dashboard', to: '/', icon: HomeIcon },
  { label: 'Pengeluaran', to: '/expenses', icon: BanknotesIcon },
  { label: 'Berulang', to: '/recurring', icon: ArrowPathIcon },
  { label: 'Anggaran', to: '/budgets', icon: ChartPieIcon },
  { label: 'Target', to: '/goals', icon: FlagIcon },
  { label: 'Profil', to: '/profile', icon: UserCircleIcon },
]

function isActive(to: string) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}

async function onLogout() {
  try {
    await logout()
    toast.success('Berhasil keluar.')
    router.replace('/login')
  } catch {
    toast.error('Gagal keluar. Coba lagi.')
  }
}
</script>
