<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Anggaran</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">Atur batas pengeluaran per kategori tiap bulan.</p>
      </div>
      <button class="btn-primary" @click="openCreate"><PlusIcon class="h-4 w-4" /> Tambah Anggaran</button>
    </div>

    <!-- Selektor bulan -->
    <div class="card flex items-center justify-between">
      <button class="btn-secondary px-3 py-1.5" @click="shiftMonth(-1)"><ChevronLeftIcon class="h-4 w-4" /></button>
      <span class="text-base font-semibold text-gray-900 dark:text-white">{{ formatMonthYear(month, year) }}</span>
      <button class="btn-secondary px-3 py-1.5" @click="shiftMonth(1)"><ChevronRightIcon class="h-4 w-4" /></button>
    </div>

    <!-- Ringkasan total -->
    <div v-if="data.items.length" class="card">
      <div class="mb-1 flex items-baseline justify-between">
        <span class="text-sm text-gray-500">Total terpakai</span>
        <span class="text-sm">
          <span class="font-bold text-gray-900 dark:text-white">{{ formatCurrency(data.totalSpent) }}</span>
          <span class="text-gray-500"> / {{ formatCurrency(data.totalLimit) }}</span>
        </span>
      </div>
      <div class="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
        <div class="h-full rounded-full" :class="totalBarColor" :style="{ width: Math.min(totalPct, 100) + '%' }" />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 3" :key="i" class="h-32 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
    </div>

    <!-- Empty -->
    <div v-else-if="!data.items.length" class="card flex flex-col items-center py-12 text-center">
      <div class="mb-3 text-4xl">📊</div>
      <p class="text-sm text-gray-500 dark:text-gray-400">Belum ada anggaran untuk {{ formatMonthYear(month, year) }}.</p>
      <button class="btn-primary mt-4" @click="openCreate"><PlusIcon class="h-4 w-4" /> Buat Anggaran Pertama</button>
    </div>

    <!-- Grid kartu -->
    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <BudgetCard v-for="b in data.items" :key="b.id" :budget="b" @edit="openEdit" @delete="askDelete" />
    </div>

    <!-- Modal tambah/edit -->
    <BaseModal v-model="showForm" :title="editing ? 'Edit Anggaran' : 'Tambah Anggaran'">
      <form class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="label">Kategori</label>
          <select v-model="form.category" class="input" :disabled="!!editing">
            <option v-for="c in CATEGORIES" :key="c.value" :value="c.value">{{ c.emoji }} {{ c.label }}</option>
          </select>
        </div>
        <div>
          <label class="label">Batas Bulanan (Rp)</label>
          <input v-model="form.monthlyLimit" type="number" min="0" step="0.01" class="input" placeholder="0" />
          <p v-if="formError" class="form-error">{{ formError }}</p>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="btn-secondary" @click="showForm = false">Batal</button>
          <button type="submit" class="btn-primary" :disabled="submitting">{{ editing ? 'Perbarui' : 'Simpan' }}</button>
        </div>
      </form>
    </BaseModal>

    <ConfirmDialog
      v-model="confirmDelete"
      title="Hapus anggaran?"
      message="Anggaran kategori ini akan dihapus. Lanjutkan?"
      :loading="submitting"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import type { BudgetWithProgress } from '~/types/models'
import { CATEGORIES } from '~/utils/constants'
import { formatCurrency, formatMonthYear } from '~/utils/formatters'

const { month, year, data, loading, fetchBudgets, saveBudget, updateBudget, deleteBudget } = useBudgets()
const toast = useToast()

const showForm = ref(false)
const editing = ref<BudgetWithProgress | null>(null)
const submitting = ref(false)
const confirmDelete = ref(false)
const target = ref<BudgetWithProgress | null>(null)
const form = reactive({ category: 'Food', monthlyLimit: '' as number | string })
const formError = ref('')

const totalPct = computed(() => (data.value.totalLimit > 0 ? Math.round((data.value.totalSpent / data.value.totalLimit) * 100) : 0))
const totalBarColor = computed(() => {
  if (totalPct.value > 100) return 'bg-danger'
  if (totalPct.value >= 80) return 'bg-warning'
  return 'bg-success'
})

onMounted(fetchBudgets)

function shiftMonth(delta: number) {
  let m = month.value + delta
  let y = year.value
  if (m < 1) {
    m = 12
    y--
  } else if (m > 12) {
    m = 1
    y++
  }
  month.value = m
  year.value = y
  fetchBudgets()
}

function openCreate() {
  editing.value = null
  form.category = 'Food'
  form.monthlyLimit = ''
  formError.value = ''
  showForm.value = true
}

function openEdit(b: BudgetWithProgress) {
  editing.value = b
  form.category = b.category
  form.monthlyLimit = b.monthlyLimit
  formError.value = ''
  showForm.value = true
}

async function onSubmit() {
  formError.value = ''
  const limit = Number(form.monthlyLimit)
  if (!limit || limit <= 0) {
    formError.value = 'Batas harus lebih dari 0.'
    return
  }
  submitting.value = true
  try {
    if (editing.value) {
      await updateBudget(editing.value.id, limit)
      toast.success('Anggaran diperbarui.')
    } else {
      await saveBudget({ category: form.category, monthlyLimit: limit })
      toast.success('Anggaran disimpan.')
    }
    showForm.value = false
    await fetchBudgets()
  } catch (e: unknown) {
    toast.error((e as { statusMessage?: string })?.statusMessage || 'Gagal menyimpan anggaran.')
  } finally {
    submitting.value = false
  }
}

function askDelete(b: BudgetWithProgress) {
  target.value = b
  confirmDelete.value = true
}

async function doDelete() {
  if (!target.value) return
  submitting.value = true
  try {
    await deleteBudget(target.value.id)
    toast.success('Anggaran dihapus.')
    confirmDelete.value = false
    await fetchBudgets()
  } catch {
    toast.error('Gagal menghapus anggaran.')
  } finally {
    submitting.value = false
  }
}
</script>
