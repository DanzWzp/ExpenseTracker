<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Analitik</h3>
    </div>

    <PeriodSelector v-model="period" v-model:from="from" v-model:to="to" />

    <!-- Pie + breakdown -->
    <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div class="card">
        <div class="mb-3 flex items-center justify-between">
          <h4 class="font-medium text-gray-800 dark:text-gray-100">Pengeluaran per Kategori</h4>
          <span class="text-sm font-semibold text-gray-500">{{ formatCurrency(breakdown.total) }}</span>
        </div>
        <div v-if="loadingCat" class="flex h-64 items-center justify-center">
          <span class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
        <div v-else-if="!breakdown.byCategory.length" class="flex h-64 items-center justify-center text-sm text-gray-400">
          Belum ada data untuk periode ini.
        </div>
        <ClientOnly v-else>
          <LazyChartsPieChart :labels="pieLabels" :data="pieData" :colors="pieColors" />
        </ClientOnly>
      </div>

      <div class="card">
        <h4 class="mb-3 font-medium text-gray-800 dark:text-gray-100">Top Kategori</h4>
        <div v-if="!breakdown.byCategory.length" class="flex h-64 items-center justify-center text-sm text-gray-400">
          —
        </div>
        <ul v-else class="space-y-3">
          <li v-for="b in breakdown.byCategory.slice(0, 5)" :key="b.category">
            <div class="mb-1 flex items-center justify-between text-sm">
              <span class="flex items-center gap-2">
                <span>{{ categoryDef(b.category).emoji }}</span>
                <span class="font-medium text-gray-700 dark:text-gray-200">{{ categoryLabel(b.category) }}</span>
                <span class="text-xs text-gray-400">({{ b.count }}×)</span>
              </span>
              <span class="text-gray-500">{{ formatCurrency(b.total) }} · {{ b.percentage }}%</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
              <div class="h-full rounded-full" :style="{ width: b.percentage + '%', backgroundColor: categoryDef(b.category).hex }" />
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Bar 30 hari -->
    <div class="card">
      <h4 class="mb-3 font-medium text-gray-800 dark:text-gray-100">Tren Harian (30 hari terakhir)</h4>
      <ClientOnly>
        <LazyChartsBarChart :labels="trends.daily.map((d) => d.label)" :data="trends.daily.map((d) => d.total)" />
        <template #fallback><div class="h-64 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-700" /></template>
      </ClientOnly>
    </div>

    <!-- Line 12 bulan -->
    <div class="card">
      <h4 class="mb-3 font-medium text-gray-800 dark:text-gray-100">Tren Bulanan (12 bulan terakhir)</h4>
      <ClientOnly>
        <LazyChartsLineChart :labels="trends.monthly.map((m) => m.label)" :data="trends.monthly.map((m) => m.total)" />
        <template #fallback><div class="h-64 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-700" /></template>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { categoryDef, categoryLabel } from '~/utils/constants'
import { formatCurrency } from '~/utils/formatters'

interface BreakdownItem {
  category: string
  total: number
  count: number
  percentage: number
}
interface BreakdownResponse {
  total: number
  byCategory: BreakdownItem[]
}
interface TrendPoint {
  label: string
  total: number
}
interface TrendsResponse {
  daily: TrendPoint[]
  monthly: TrendPoint[]
}

const period = ref('month')
const from = ref('')
const to = ref('')

const breakdown = ref<BreakdownResponse>({ total: 0, byCategory: [] })
const trends = ref<TrendsResponse>({ daily: [], monthly: [] })
const loadingCat = ref(false)

const pieLabels = computed(() => breakdown.value.byCategory.map((b) => categoryLabel(b.category)))
const pieData = computed(() => breakdown.value.byCategory.map((b) => b.total))
const pieColors = computed(() => breakdown.value.byCategory.map((b) => categoryDef(b.category).hex))

async function loadBreakdown() {
  loadingCat.value = true
  try {
    breakdown.value = await $fetch<BreakdownResponse>('/api/analytics/category-breakdown', {
      query: { period: period.value, from: from.value || undefined, to: to.value || undefined },
    })
  } catch {
    breakdown.value = { total: 0, byCategory: [] }
  } finally {
    loadingCat.value = false
  }
}

async function loadTrends() {
  try {
    trends.value = await $fetch<TrendsResponse>('/api/analytics/trends')
  } catch {
    trends.value = { daily: [], monthly: [] }
  }
}

watch(period, () => {
  if (period.value !== 'custom') loadBreakdown()
})

const debouncedCustom = useDebounceFn(loadBreakdown, 400)
watch([from, to], () => {
  if (period.value === 'custom') debouncedCustom()
})

onMounted(() => {
  loadBreakdown()
  loadTrends()
})
</script>
