<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Target Keuangan</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">Buat target tabungan dan pantau progresnya.</p>
      </div>
      <button class="btn-primary" @click="openCreate"><PlusIcon class="h-4 w-4" /> Tambah Target</button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 3" :key="i" class="h-44 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
    </div>

    <!-- Empty -->
    <div v-else-if="!items.length" class="card flex flex-col items-center py-12 text-center">
      <div class="mb-3 text-4xl">🎯</div>
      <p class="text-sm text-gray-500 dark:text-gray-400">Belum ada target keuangan.</p>
      <button class="btn-primary mt-4" @click="openCreate"><PlusIcon class="h-4 w-4" /> Buat Target Pertama</button>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <GoalCard v-for="g in items" :key="g.id" :goal="g" @edit="openEdit" @delete="askDelete" @add="openAdd" />
    </div>

    <!-- Modal tambah/edit -->
    <BaseModal v-model="showForm" :title="editing ? 'Edit Target' : 'Tambah Target'">
      <form class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="label">Nama Target</label>
          <input v-model="form.name" type="text" class="input" placeholder="Contoh: Dana darurat" />
          <p v-if="errors.name" class="form-error">{{ errors.name }}</p>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="label">Target (Rp)</label>
            <input v-model="form.targetAmount" type="number" min="0" step="0.01" class="input" placeholder="0" />
            <p v-if="errors.targetAmount" class="form-error">{{ errors.targetAmount }}</p>
          </div>
          <div v-if="!editing">
            <label class="label">Tabungan Awal (Rp)</label>
            <input v-model="form.currentAmount" type="number" min="0" step="0.01" class="input" placeholder="0" />
          </div>
        </div>
        <div>
          <label class="label">Tenggat</label>
          <input v-model="form.deadline" type="date" class="input" />
          <p v-if="errors.deadline" class="form-error">{{ errors.deadline }}</p>
        </div>
        <div>
          <label class="label">Deskripsi (opsional)</label>
          <textarea v-model="form.description" rows="2" maxlength="500" class="input resize-none" placeholder="Catatan singkat" />
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="btn-secondary" @click="showForm = false">Batal</button>
          <button type="submit" class="btn-primary" :disabled="submitting">{{ editing ? 'Perbarui' : 'Simpan' }}</button>
        </div>
      </form>
    </BaseModal>

    <!-- Modal tambah tabungan -->
    <BaseModal v-model="showAdd" title="Tambah Tabungan">
      <form class="space-y-4" @submit.prevent="onAddSavings">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Target: <span class="font-medium text-gray-800 dark:text-gray-200">{{ addTarget?.name }}</span>
        </p>
        <div>
          <label class="label">Jumlah Ditabung (Rp)</label>
          <input v-model="addAmount" type="number" min="0" step="0.01" class="input" placeholder="0" autofocus />
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="btn-secondary" @click="showAdd = false">Batal</button>
          <button type="submit" class="btn-primary" :disabled="submitting">Tambah</button>
        </div>
      </form>
    </BaseModal>

    <ConfirmDialog
      v-model="confirmDelete"
      title="Hapus target?"
      message="Target keuangan ini akan dihapus permanen. Lanjutkan?"
      :loading="submitting"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/outline'
import type { Goal } from '~/types/models'
import { toDateInput } from '~/utils/formatters'

const { items, loading, fetchGoals, createGoal, updateGoal, addToGoal, deleteGoal } = useGoals()
const toast = useToast()

const showForm = ref(false)
const showAdd = ref(false)
const confirmDelete = ref(false)
const editing = ref<Goal | null>(null)
const target = ref<Goal | null>(null)
const addTarget = ref<Goal | null>(null)
const addAmount = ref<number | string>('')
const submitting = ref(false)

const defaultDeadline = () => {
  const d = new Date()
  return toDateInput(new Date(d.getFullYear(), d.getMonth() + 3, d.getDate()))
}

const form = reactive({
  name: '',
  targetAmount: '' as number | string,
  currentAmount: '' as number | string,
  deadline: defaultDeadline(),
  description: '',
})

const errors = reactive<{ name?: string; targetAmount?: string; deadline?: string }>({})

onMounted(fetchGoals)

function openCreate() {
  editing.value = null
  Object.assign(form, { name: '', targetAmount: '', currentAmount: '', deadline: defaultDeadline(), description: '' })
  clearErrors()
  showForm.value = true
}

function openEdit(g: Goal) {
  editing.value = g
  Object.assign(form, {
    name: g.name,
    targetAmount: g.targetAmount,
    currentAmount: g.currentAmount,
    deadline: toDateInput(g.deadline),
    description: g.description || '',
  })
  clearErrors()
  showForm.value = true
}

function clearErrors() {
  errors.name = undefined
  errors.targetAmount = undefined
  errors.deadline = undefined
}

function validate() {
  clearErrors()
  let ok = true
  if (!form.name.trim()) {
    errors.name = 'Nama target wajib diisi.'
    ok = false
  }
  if (!Number(form.targetAmount) || Number(form.targetAmount) <= 0) {
    errors.targetAmount = 'Target harus lebih dari 0.'
    ok = false
  }
  if (!form.deadline) {
    errors.deadline = 'Tenggat wajib diisi.'
    ok = false
  }
  return ok
}

async function onSubmit() {
  if (!validate()) return
  submitting.value = true
  try {
    const payload = {
      name: form.name.trim(),
      targetAmount: Number(form.targetAmount),
      deadline: new Date(form.deadline).toISOString(),
      description: form.description,
    }
    if (editing.value) {
      await updateGoal(editing.value.id, payload)
      toast.success('Target diperbarui.')
    } else {
      await createGoal({ ...payload, currentAmount: Number(form.currentAmount) || 0 })
      toast.success('Target dibuat.')
    }
    showForm.value = false
    await fetchGoals()
  } catch (e: unknown) {
    toast.error((e as { statusMessage?: string })?.statusMessage || 'Gagal menyimpan target.')
  } finally {
    submitting.value = false
  }
}

function openAdd(g: Goal) {
  addTarget.value = g
  addAmount.value = ''
  showAdd.value = true
}

async function onAddSavings() {
  if (!addTarget.value) return
  const amount = Number(addAmount.value)
  if (!amount || amount <= 0) {
    toast.error('Masukkan jumlah yang valid.')
    return
  }
  submitting.value = true
  try {
    const updated = await addToGoal(addTarget.value, amount)
    showAdd.value = false
    await fetchGoals()
    toast.success(updated.isCompleted ? '🎉 Target tercapai!' : 'Tabungan ditambahkan.')
  } catch {
    toast.error('Gagal menambah tabungan.')
  } finally {
    submitting.value = false
  }
}

function askDelete(g: Goal) {
  target.value = g
  confirmDelete.value = true
}

async function doDelete() {
  if (!target.value) return
  submitting.value = true
  try {
    await deleteGoal(target.value.id)
    toast.success('Target dihapus.')
    confirmDelete.value = false
    await fetchGoals()
  } catch {
    toast.error('Gagal menghapus target.')
  } finally {
    submitting.value = false
  }
}
</script>
