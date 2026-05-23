<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Pengeluaran Berulang</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">Otomatis tercatat sesuai jadwal (mingguan/bulanan/tahunan).</p>
      </div>
      <div class="flex gap-2">
        <button class="btn-secondary" :disabled="generating" @click="onGenerate">
          <ArrowPathIcon class="h-4 w-4" :class="generating ? 'animate-spin' : ''" /> Generate
        </button>
        <button class="btn-primary" @click="openCreate"><PlusIcon class="h-4 w-4" /> Tambah Berulang</button>
      </div>
    </div>

    <!-- Info -->
    <div class="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
      🔁 Pengeluaran jatuh tempo dibuat otomatis saat kamu membuka aplikasi. Klik <b>Generate</b> untuk memproses sekarang.
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 3" :key="i" class="h-40 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
    </div>

    <!-- Empty -->
    <div v-else-if="!items.length" class="card flex flex-col items-center py-12 text-center">
      <div class="mb-3 text-4xl">🔁</div>
      <p class="text-sm text-gray-500 dark:text-gray-400">Belum ada pengeluaran berulang.</p>
      <button class="btn-primary mt-4" @click="openCreate"><PlusIcon class="h-4 w-4" /> Buat yang Pertama</button>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="r in items" :key="r.id" class="card" :class="!r.isActive ? 'opacity-60' : ''">
        <div class="mb-2 flex items-start justify-between">
          <CategoryBadge :category="r.category" />
          <span class="badge bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">{{ freqLabel(r.frequency) }}</span>
        </div>

        <p class="text-lg font-bold text-gray-900 dark:text-white">{{ formatCurrency(r.amount) }}</p>
        <p v-if="r.description" class="truncate text-sm text-gray-500">{{ r.description }}</p>

        <div class="mt-2 space-y-0.5 text-xs text-gray-500">
          <p>Mulai: {{ formatDate(r.startDate) }}</p>
          <p v-if="r.endDate">Berakhir: {{ formatDate(r.endDate) }}</p>
          <p v-if="r.nextDue" class="font-medium text-primary">Jatuh tempo berikutnya: {{ formatDate(r.nextDue) }}</p>
          <p v-else class="text-gray-400">{{ r.isActive ? 'Selesai' : 'Dijeda' }}</p>
        </div>

        <div class="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
          <label class="flex cursor-pointer items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
            <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" :checked="r.isActive" @change="onToggle(r)" />
            Aktif
          </label>
          <div class="flex gap-1">
            <button class="btn-ghost p-1.5" title="Lewati sekali" :disabled="!r.isActive" @click="onSkip(r)"><ForwardIcon class="h-4 w-4" /></button>
            <button class="btn-ghost p-1.5" title="Edit" @click="openEdit(r)"><PencilSquareIcon class="h-4 w-4" /></button>
            <button class="btn-ghost p-1.5 text-danger" title="Hapus" @click="askDelete(r)"><TrashIcon class="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal tambah/edit -->
    <BaseModal v-model="showForm" :title="editing ? 'Edit Pengeluaran Berulang' : 'Tambah Pengeluaran Berulang'">
      <RecurringForm :recurring="editing" :submitting="submitting" @submit="onSubmit" @cancel="showForm = false" />
    </BaseModal>

    <ConfirmDialog
      v-model="confirmDelete"
      title="Hapus pengeluaran berulang?"
      message="Jadwal ini akan dihapus. Expense yang sudah ter-generate tetap tersimpan. Lanjutkan?"
      :loading="submitting"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { PlusIcon, ArrowPathIcon, ForwardIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'
import type { RecurringExpense } from '~/types/models'
import type { RecurringInput } from '~/composables/useRecurring'
import { RECURRING_FREQUENCIES } from '~/utils/constants'
import { formatCurrency, formatDate } from '~/utils/formatters'

const { items, loading, fetchRecurring, createRecurring, updateRecurring, toggleActive, skipNext, deleteRecurring, generate } = useRecurring()
const toast = useToast()

const showForm = ref(false)
const editing = ref<RecurringExpense | null>(null)
const submitting = ref(false)
const generating = ref(false)
const confirmDelete = ref(false)
const target = ref<RecurringExpense | null>(null)

function freqLabel(value: string) {
  return RECURRING_FREQUENCIES.find((f) => f.value === value)?.label ?? value
}

onMounted(async () => {
  // Auto-generate yang jatuh tempo, lalu tampilkan daftar.
  try {
    await generate()
  } catch {
    /* abaikan; tetap tampilkan daftar */
  }
  await fetchRecurring()
})

function openCreate() {
  editing.value = null
  showForm.value = true
}

function openEdit(r: RecurringExpense) {
  editing.value = r
  showForm.value = true
}

async function onSubmit(payload: RecurringInput) {
  submitting.value = true
  try {
    if (editing.value) {
      await updateRecurring(editing.value.id, payload)
      toast.success('Pengeluaran berulang diperbarui.')
    } else {
      await createRecurring(payload)
      toast.success('Pengeluaran berulang dibuat.')
    }
    showForm.value = false
    await fetchRecurring()
  } catch (e: unknown) {
    toast.error((e as { statusMessage?: string })?.statusMessage || 'Gagal menyimpan.')
  } finally {
    submitting.value = false
  }
}

async function onToggle(r: RecurringExpense) {
  try {
    await toggleActive(r)
    await fetchRecurring()
  } catch {
    toast.error('Gagal mengubah status.')
  }
}

async function onSkip(r: RecurringExpense) {
  try {
    await skipNext(r.id)
    toast.success('Satu siklus dilewati.')
    await fetchRecurring()
  } catch {
    toast.error('Gagal melewati siklus.')
  }
}

async function onGenerate() {
  generating.value = true
  try {
    const res = await generate()
    toast.success(res.created > 0 ? `${res.created} pengeluaran dibuat otomatis.` : 'Tidak ada yang jatuh tempo.')
    await fetchRecurring()
  } catch {
    toast.error('Gagal generate.')
  } finally {
    generating.value = false
  }
}

function askDelete(r: RecurringExpense) {
  target.value = r
  confirmDelete.value = true
}

async function doDelete() {
  if (!target.value) return
  submitting.value = true
  try {
    await deleteRecurring(target.value.id)
    toast.success('Pengeluaran berulang dihapus.')
    confirmDelete.value = false
    await fetchRecurring()
  } catch {
    toast.error('Gagal menghapus.')
  } finally {
    submitting.value = false
  }
}
</script>
