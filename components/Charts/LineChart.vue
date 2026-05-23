<template>
  <div class="relative h-64">
    <Line :data="chartData" :options="options" />
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js'
import { formatCurrency, formatNumber } from '~/utils/formatters'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

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
      borderColor: '#10B981',
      backgroundColor: 'rgba(16,185,129,0.12)',
      fill: true,
      tension: 0.35,
      pointRadius: 3,
      pointBackgroundColor: '#10B981',
    },
  ],
}))

const options = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: { label: (ctx: TooltipItem<'line'>) => ` ${formatCurrency(ctx.parsed.y ?? 0)}` },
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: tick.value, font: { size: 10 } } },
    y: {
      grid: { color: grid.value },
      ticks: { color: tick.value, callback: (value: number | string) => formatNumber(Number(value)), font: { size: 10 } },
      beginAtZero: true,
    },
  },
}))
</script>
