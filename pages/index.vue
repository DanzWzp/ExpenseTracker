<template>
  <div class="space-y-6">
    <!-- Sapaan -->
    <div>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Halo, {{ displayName }} 👋
      </h2>
      <p class="text-sm text-gray-500 dark:text-gray-400">Berikut ringkasan keuanganmu.</p>
    </div>

    <!-- Loading kartu -->
    <div v-if="pending" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="i in 4" :key="i" class="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
    </div>

    <!-- Kartu ringkasan -->
    <div v-else-if="data" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        title="Pengeluaran Bulan Ini"
        :value="formatCurrency(data.monthTotal)"
        :subtitle="`${data.monthCount} transaksi`"
        emoji="📅"
      />
      <SummaryCard
        title="Pengeluaran Tahun Ini"
        :value="formatCurrency(data.yearTotal)"
        emoji="🗓️"
        icon-bg="bg-purple-100 text-purple-700 dark:bg-purple-600/30 dark:text-purple-200"
      />
      <SummaryCard
        title="Rata-rata Harian"
        :value="formatCurrency(data.avgDaily)"
        subtitle="bulan ini"
        emoji="📊"
        icon-bg="bg-green-100 text-green-700 dark:bg-green-600/30 dark:text-green-200"
      />
      <SummaryCard
        title="Kategori Terbesar"
        :value="data.topCategory ? categoryLabel(data.topCategory.category) : '—'"
        :subtitle="data.topCategory ? formatCurrency(data.topCategory.total) : 'Belum ada data'"
        emoji="🏆"
        icon-bg="bg-amber-100 text-amber-700 dark:bg-amber-600/30 dark:text-amber-200"
      />
    </div>

    <!-- Analitik: charts + selektor periode -->
    <AnalyticsSection />

    <!-- Transaksi terbaru -->
    <div class="card">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="font-semibold text-gray-900 dark:text-white">Transaksi Terbaru</h3>
        <NuxtLink to="/expenses" class="text-sm font-medium text-primary hover:underline">Lihat semua</NuxtLink>
      </div>
      <div v-if="!data?.recent.length" class="py-8 text-center text-sm text-gray-400">
        Belum ada transaksi.
      </div>
      <ul v-else class="divide-y divide-gray-100 dark:divide-gray-700">
        <li v-for="e in data.recent" :key="e.id" class="flex items-center justify-between py-2.5">
          <div class="flex items-center gap-3">
            <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-base dark:bg-gray-700">
              {{ categoryDef(e.category).emoji }}
            </span>
            <div>
              <p class="text-sm font-medium text-gray-800 dark:text-gray-100">{{ e.description || categoryLabel(e.category) }}</p>
              <p class="text-xs text-gray-400">{{ formatDate(e.date) }}</p>
            </div>
          </div>
          <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ formatCurrency(e.amount) }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Expense } from '~/types/models'
import { categoryDef, categoryLabel } from '~/utils/constants'
import { formatCurrency, formatDate } from '~/utils/formatters'

interface SummaryResponse {
  monthTotal: number
  yearTotal: number
  avgDaily: number
  monthCount: number
  topCategory: { category: string; total: number; percentage: number } | null
  categoryBreakdown: { category: string; total: number; percentage: number }[]
  recent: Expense[]
}

const { displayName } = useAuth()
const { data, pending } = await useFetch<SummaryResponse>('/api/analytics/summary', {
  lazy: true,
  default: () => null,
})
</script>
