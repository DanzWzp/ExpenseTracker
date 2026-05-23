<template>
  <div class="space-y-5">
    <!-- Header aksi -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Pengeluaran</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Total (sesuai filter): <span class="font-semibold text-gray-700 dark:text-gray-200">{{ formatCurrency(filteredSum) }}</span>
        </p>
      </div>
      <div class="flex gap-2">
        <button class="btn-secondary" :disabled="exporting || !total" @click="onExport">
          <ArrowDownTrayIcon class="h-4 w-4" /> Export CSV
        </button>
        <button class="btn-primary" @click="openCreate">
          <PlusIcon class="h-4 w-4" /> Tambah Pengeluaran
        </button>
      </div>
    </div>

    <!-- Filter -->
    <div class="card">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div class="lg:col-span-2">
          <label class="label">Cari deskripsi</label>
          <div class="relative">
            <MagnifyingGlassIcon class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input v-model="filters.search" type="text" class="input pl-9" placeholder="Cari..." />
          </div>
        </div>
        <div>
          <label class="label">Kategori</label>
          <select v-model="filters.category" class="input">
            <option value="all">Semua</option>
            <option v-for="c in CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</option>
          </select>
        </div>
        <div>
          <label class="label">Pembayaran</label>
          <select v-model="filters.paymentMethod" class="input">
            <option value="all">Semua</option>
            <option v-for="p in PAYMENT_METHODS" :key="p.value" :value="p.value">{{ p.label }}</option>
          </select>
        </div>
        <div class="flex items-end">
          <button class="btn-secondary w-full" @click="resetFilters">Reset</button>
        </div>
        <div>
          <label class="label">Dari tanggal</label>
          <input v-model="filters.dateFrom" type="date" class="input" />
        </div>
        <div>
          <label class="label">Sampai tanggal</label>
          <input v-model="filters.dateTo" type="date" class="input" />
        </div>
      </div>
    </div>

    <!-- Bulk action bar -->
    <Transition name="fade">
      <div v-if="selected.length" class="flex items-center justify-between rounded-lg bg-primary-50 px-4 py-2.5 dark:bg-primary-600/20">
        <span class="text-sm font-medium text-primary-700 dark:text-primary-100">{{ selected.length }} item dipilih</span>
        <div class="flex gap-2">
          <button class="btn-ghost text-sm" @click="selected = []">Batal pilih</button>
          <button class="btn-danger" @click="confirmBulk = true"><TrashIcon class="h-4 w-4" /> Hapus terpilih</button>
        </div>
      </div>
    </Transition>

    <!-- Loading / Error -->
    <div v-if="error" class="rounded-lg bg-red-50 px-4 py-3 text-sm text-danger dark:bg-red-900/30">{{ error }}</div>
    <div v-if="loading" class="space-y-2">
      <div v-for="i in 4" :key="i" class="h-14 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
    </div>

    <!-- Tabel -->
    <ExpenseTable
      v-show="!loading"
      v-model:selected="selected"
      :items="items"
      :sort-by="filters.sortBy"
      :sort-dir="filters.sortDir"
      :loading="loading"
      @sort="toggleSort"
      @edit="openEdit"
      @duplicate="onDuplicate"
      @delete="askDelete"
    />

    <!-- Pagination -->
    <div v-if="total > 0" class="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <div class="flex items-center gap-2 text-sm text-gray-500">
        <span>Tampilkan</span>
        <select v-model.number="filters.pageSize" class="input w-auto py-1">
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
        </select>
        <span>dari {{ total }} data</span>
      </div>
      <div class="flex items-center gap-1">
        <button class="btn-secondary px-3 py-1.5" :disabled="filters.page <= 1" @click="goToPage(filters.page - 1)">
          <ChevronLeftIcon class="h-4 w-4" />
        </button>
        <span class="px-3 text-sm text-gray-600 dark:text-gray-300">Hal. {{ filters.page }} / {{ totalPages }}</span>
        <button class="btn-secondary px-3 py-1.5" :disabled="filters.page >= totalPages" @click="goToPage(filters.page + 1)">
          <ChevronRightIcon class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Modal tambah/edit -->
    <BaseModal v-model="showForm" :title="editing ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'">
      <ExpenseForm :expense="editing" :submitting="submitting" @submit="onSubmitForm" @cancel="showForm = false" />
    </BaseModal>

    <!-- Konfirmasi hapus satu -->
    <ConfirmDialog
      v-model="confirmOne"
      title="Hapus pengeluaran?"
      message="Data pengeluaran ini akan dihapus permanen. Lanjutkan?"
      :loading="submitting"
      @confirm="doDelete"
    />

    <!-- Konfirmasi hapus massal -->
    <ConfirmDialog
      v-model="confirmBulk"
      title="Hapus item terpilih?"
      :message="`${selected.length} pengeluaran akan dihapus permanen. Lanjutkan?`"
      :loading="submitting"
      @confirm="doBulkDelete"
    />
  </div>
</template>

<script setup lang="ts">
import {
  PlusIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/vue/24/outline'
import type { Expense, ExpenseFormData } from '~/types/models'
import { CATEGORIES, PAYMENT_METHODS } from '~/utils/constants'
import { formatCurrency } from '~/utils/formatters'

const {
  items,
  total,
  totalPages,
  filteredSum,
  loading,
  error,
  filters,
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  bulkDelete,
  duplicateExpense,
  toggleSort,
  exportCsv,
} = useExpenses()

const toast = useToast()

// Realtime: sinkron otomatis saat ada perubahan pada pengeluaran
// (mis. dari perangkat/tab lain). Memerlukan Realtime+RLS aktif di Supabase.
useRealtimeExpenses(() => {
  fetchExpenses()
})

const selected = ref<string[]>([])
const showForm = ref(false)
const editing = ref<Expense | null>(null)
const submitting = ref(false)
const exporting = ref(false)
const confirmOne = ref(false)
const confirmBulk = ref(false)
const target = ref<Expense | null>(null)

// Muat awal
onMounted(fetchExpenses)

// Refetch saat filter (selain page) berubah → reset ke halaman 1.
watch(
  () => [filters.category, filters.paymentMethod, filters.dateFrom, filters.dateTo, filters.pageSize, filters.sortBy, filters.sortDir],
  () => {
    filters.page = 1
    fetchExpenses()
  },
)

// Pencarian dengan debounce.
const debouncedSearch = useDebounceFn(() => {
  filters.page = 1
  fetchExpenses()
}, 350)
watch(() => filters.search, debouncedSearch)

function goToPage(p: number) {
  if (p < 1 || p > totalPages.value) return
  filters.page = p
  fetchExpenses()
}

function resetFilters() {
  filters.category = 'all'
  filters.paymentMethod = 'all'
  filters.search = ''
  filters.dateFrom = ''
  filters.dateTo = ''
}

function openCreate() {
  editing.value = null
  showForm.value = true
}

function openEdit(e: Expense) {
  editing.value = e
  showForm.value = true
}

async function onSubmitForm(payload: ExpenseFormData) {
  submitting.value = true
  try {
    if (editing.value) {
      await updateExpense(editing.value.id, payload)
      toast.success('Pengeluaran diperbarui.')
    } else {
      await createExpense(payload)
      toast.success('Pengeluaran ditambahkan.')
    }
    showForm.value = false
    await fetchExpenses()
  } catch (e: unknown) {
    toast.error((e as { statusMessage?: string })?.statusMessage || 'Gagal menyimpan pengeluaran.')
  } finally {
    submitting.value = false
  }
}

async function onDuplicate(e: Expense) {
  try {
    await duplicateExpense(e)
    toast.success('Pengeluaran diduplikat (tanggal hari ini).')
    await fetchExpenses()
  } catch {
    toast.error('Gagal menduplikat pengeluaran.')
  }
}

function askDelete(e: Expense) {
  target.value = e
  confirmOne.value = true
}

async function doDelete() {
  if (!target.value) return
  submitting.value = true
  try {
    await deleteExpense(target.value.id)
    toast.success('Pengeluaran dihapus.')
    confirmOne.value = false
    await fetchExpenses()
  } catch {
    toast.error('Gagal menghapus pengeluaran.')
  } finally {
    submitting.value = false
  }
}

async function doBulkDelete() {
  submitting.value = true
  try {
    const res = await bulkDelete(selected.value)
    toast.success(`${(res as { deleted: number }).deleted} pengeluaran dihapus.`)
    selected.value = []
    confirmBulk.value = false
    await fetchExpenses()
  } catch {
    toast.error('Gagal menghapus item terpilih.')
  } finally {
    submitting.value = false
  }
}

async function onExport() {
  exporting.value = true
  try {
    await exportCsv()
    toast.success('File CSV diunduh.')
  } catch {
    toast.error('Gagal mengekspor CSV.')
  } finally {
    exporting.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
