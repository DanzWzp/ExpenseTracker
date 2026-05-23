<template>
  <div>
    <!-- Tabel (desktop / tablet) -->
    <div class="hidden overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 sm:block">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th class="w-10 px-4 py-3">
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                :checked="allSelected"
                :disabled="!items.length"
                @change="toggleAll"
              />
            </th>
            <th v-for="col in columns" :key="col.key" scope="col" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <button v-if="col.sortable" class="inline-flex items-center gap-1 hover:text-gray-900 dark:hover:text-white" @click="$emit('sort', col.key)">
                {{ col.label }}
                <span class="text-gray-400">
                  <ChevronUpDownIcon v-if="sortBy !== col.key" class="h-3.5 w-3.5" />
                  <ChevronUpIcon v-else-if="sortDir === 'asc'" class="h-3.5 w-3.5 text-primary" />
                  <ChevronDownIcon v-else class="h-3.5 w-3.5 text-primary" />
                </span>
              </button>
              <span v-else>{{ col.label }}</span>
            </th>
            <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
          <tr v-for="e in items" :key="e.id" class="transition hover:bg-gray-50 dark:hover:bg-gray-700/50" :class="{ 'bg-primary-50 dark:bg-primary-600/10': selected.includes(e.id) }">
            <td class="px-4 py-3">
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                :checked="selected.includes(e.id)"
                @change="toggleOne(e.id)"
              />
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{{ formatDate(e.date) }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1.5">
                <CategoryBadge :category="e.category" />
                <span v-if="e.recurringExpenseId" title="Dari pengeluaran berulang">🔁</span>
              </div>
            </td>
            <td class="max-w-xs truncate px-4 py-3 text-sm text-gray-600 dark:text-gray-400" :title="e.description || ''">
              {{ e.description || '—' }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">{{ formatCurrency(e.amount) }}</td>
            <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ paymentLabel(e.paymentMethod) }}</td>
            <td class="whitespace-nowrap px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-1">
                <button class="btn-ghost p-1.5" title="Edit" @click="$emit('edit', e)"><PencilSquareIcon class="h-4 w-4" /></button>
                <button class="btn-ghost p-1.5" title="Duplikat" @click="$emit('duplicate', e)"><DocumentDuplicateIcon class="h-4 w-4" /></button>
                <button class="btn-ghost p-1.5 text-danger" title="Hapus" @click="$emit('delete', e)"><TrashIcon class="h-4 w-4" /></button>
              </div>
            </td>
          </tr>
          <tr v-if="!items.length && !loading">
            <td :colspan="columns.length + 2" class="px-4 py-12 text-center text-sm text-gray-500">
              Belum ada pengeluaran. Klik "Tambah Pengeluaran" untuk memulai. 📝
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Kartu (mobile) -->
    <div class="space-y-3 sm:hidden">
      <div v-for="e in items" :key="e.id" class="card p-4" :class="{ 'ring-2 ring-primary': selected.includes(e.id) }">
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2">
            <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary" :checked="selected.includes(e.id)" @change="toggleOne(e.id)" />
            <CategoryBadge :category="e.category" />
            <span v-if="e.recurringExpenseId" title="Dari pengeluaran berulang">🔁</span>
          </div>
          <span class="text-base font-bold text-gray-900 dark:text-white">{{ formatCurrency(e.amount) }}</span>
        </div>
        <p v-if="e.description" class="mt-2 text-sm text-gray-600 dark:text-gray-400">{{ e.description }}</p>
        <div class="mt-3 flex items-center justify-between">
          <div class="text-xs text-gray-500">{{ formatDate(e.date) }} · {{ paymentLabel(e.paymentMethod) }}</div>
          <div class="flex gap-1">
            <button class="btn-ghost p-1.5" @click="$emit('edit', e)"><PencilSquareIcon class="h-4 w-4" /></button>
            <button class="btn-ghost p-1.5" @click="$emit('duplicate', e)"><DocumentDuplicateIcon class="h-4 w-4" /></button>
            <button class="btn-ghost p-1.5 text-danger" @click="$emit('delete', e)"><TrashIcon class="h-4 w-4" /></button>
          </div>
        </div>
      </div>
      <div v-if="!items.length && !loading" class="card py-10 text-center text-sm text-gray-500">
        Belum ada pengeluaran. 📝
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronUpDownIcon,
  PencilSquareIcon,
  DocumentDuplicateIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'
import type { Expense, SortDir } from '~/types/models'
import { paymentLabel } from '~/utils/constants'
import { formatCurrency, formatDate } from '~/utils/formatters'

const props = defineProps<{
  items: Expense[]
  sortBy: string
  sortDir: SortDir
  selected: string[]
  loading?: boolean
}>()

const emit = defineEmits<{
  sort: [string]
  edit: [Expense]
  duplicate: [Expense]
  delete: [Expense]
  'update:selected': [string[]]
}>()

const columns = [
  { key: 'date', label: 'Tanggal', sortable: true },
  { key: 'category', label: 'Kategori', sortable: true },
  { key: 'description', label: 'Deskripsi', sortable: false },
  { key: 'amount', label: 'Jumlah', sortable: true },
  { key: 'paymentMethod', label: 'Pembayaran', sortable: true },
]

const allSelected = computed(() => props.items.length > 0 && props.items.every((e) => props.selected.includes(e.id)))

function toggleOne(id: string) {
  const set = new Set(props.selected)
  set.has(id) ? set.delete(id) : set.add(id)
  emit('update:selected', [...set])
}

function toggleAll() {
  if (allSelected.value) {
    emit('update:selected', props.selected.filter((id) => !props.items.some((e) => e.id === id)))
  } else {
    const set = new Set(props.selected)
    props.items.forEach((e) => set.add(e.id))
    emit('update:selected', [...set])
  }
}
</script>
