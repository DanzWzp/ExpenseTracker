<template>
  <div class="relative h-64">
    <Bar :data="chartData" :options="options" />
  </div>
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js'
import { formatCurrency, formatNumber } from '~/utils/formatters'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const props = defineProps<{ labels: string[]; data: number[] }>()
const { isDark } = useDarkMode()

const grid = computed(() => (isDark.value ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'))
const tick = computed(() => (isDark.value ? '#9CA3AF' : '#6B7280'))

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: 'Pengeluaran',
      data: props.data,
      backgroundColor: '#3B82F6',
      borderRadius: 4,
      maxBarThickness: 18,
    },
  ],
}))

const options = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: { label: (ctx: TooltipItem<'bar'>) => ` ${formatCurrency(ctx.parsed.y ?? 0)}` },
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: tick.value, maxRotation: 0, autoSkip: true, maxTicksLimit: 10, font: { size: 10 } } },
    y: {
      grid: { color: grid.value },
      ticks: { color: tick.value, callback: (value: number | string) => formatNumber(Number(value)), font: { size: 10 } },
      beginAtZero: true,
    },
  },
}))
</script>
