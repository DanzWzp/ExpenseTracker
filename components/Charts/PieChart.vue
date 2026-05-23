<template>
  <div class="relative h-64">
    <Pie :data="chartData" :options="options" />
  </div>
</template>

<script setup lang="ts">
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { formatCurrency } from '~/utils/formatters'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{ labels: string[]; data: number[]; colors: string[] }>()
const { isDark } = useDarkMode()

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      data: props.data,
      backgroundColor: props.colors,
      borderColor: isDark.value ? '#1F2937' : '#FFFFFF',
      borderWidth: 2,
    },
  ],
}))

const options = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { color: isDark.value ? '#E5E7EB' : '#374151', padding: 12, font: { size: 12 } },
    },
    tooltip: {
      callbacks: {
        label: (ctx: { label?: string; parsed: number }) =>
          ` ${ctx.label}: ${formatCurrency(ctx.parsed)}`,
      },
    },
  },
}))
</script>
