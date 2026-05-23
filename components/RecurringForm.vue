<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div>
      <label class="label">Jumlah (Rp) <span class="text-danger">*</span></label>
      <input v-model="form.amount" type="number" min="0" step="0.01" class="input" placeholder="0" />
      <p v-if="errors.amount" class="form-error">{{ errors.amount }}</p>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label class="label">Kategori <span class="text-danger">*</span></label>
        <select v-model="form.category" class="input">
          <option v-for="c in CATEGORIES" :key="c.value" :value="c.value">{{ c.emoji }} {{ c.label }}</option>
        </select>
      </div>
      <div>
        <label class="label">Metode Pembayaran <span class="text-danger">*</span></label>
        <select v-model="form.paymentMethod" class="input">
          <option v-for="p in PAYMENT_METHODS" :key="p.value" :value="p.value">{{ p.label }}</option>
        </select>
      </div>
    </div>

    <div>
      <label class="label">Frekuensi <span class="text-danger">*</span></label>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="f in RECURRING_FREQUENCIES"
          :key="f.value"
          type="button"
          class="rounded-lg border px-3 py-2 text-sm font-medium transition"
          :class="form.frequency === f.value
            ? 'border-primary bg-primary-50 text-primary dark:bg-primary-600/20'
            : 'border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'"
          @click="form.frequency = f.value"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label class="label">Mulai <span class="text-danger">*</span></label>
        <input v-model="form.startDate" type="date" class="input" />
        <p v-if="errors.startDate" class="form-error">{{ errors.startDate }}</p>
      </div>
      <div>
        <label class="label">Berakhir (opsional)</label>
        <input v-model="form.endDate" type="date" class="input" />
        <p class="mt-1 text-xs text-gray-400">Kosongkan untuk berulang tanpa batas.</p>
      </div>
    </div>

    <div>
      <label class="label">Deskripsi (opsional)</label>
      <textarea v-model="form.description" rows="2" maxlength="500" class="input resize-none" placeholder="Contoh: Langganan streaming" />
    </div>

    <div class="flex justify-end gap-2 pt-2">
      <button type="button" class="btn-secondary" @click="$emit('cancel')">Batal</button>
      <button type="submit" class="btn-primary" :disabled="submitting">{{ isCreate ? 'Simpan' : 'Perbarui' }}</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { RecurringExpense } from '~/types/models'
import type { RecurringInput } from '~/composables/useRecurring'
import { CATEGORIES, PAYMENT_METHODS, RECURRING_FREQUENCIES } from '~/utils/constants'
import { toDateInput } from '~/utils/formatters'

const props = withDefaults(
  defineProps<{ recurring?: RecurringExpense | null; submitting?: boolean }>(),
  { recurring: null, submitting: false },
)
const emit = defineEmits<{ submit: [RecurringInput]; cancel: [] }>()

const isCreate = computed(() => !props.recurring)

const form = reactive({
  amount: '' as number | string,
  category: 'Food',
  paymentMethod: 'Cash',
  frequency: 'Monthly',
  startDate: toDateInput(new Date()),
  endDate: '',
  description: '',
})

const errors = reactive<{ amount?: string; startDate?: string }>({})

onMounted(() => {
  if (props.recurring) {
    form.amount = props.recurring.amount
    form.category = props.recurring.category
    form.paymentMethod = props.recurring.paymentMethod
    form.frequency = props.recurring.frequency
    form.startDate = toDateInput(props.recurring.startDate)
    form.endDate = props.recurring.endDate ? toDateInput(props.recurring.endDate) : ''
    form.description = props.recurring.description || ''
  }
})

function validate() {
  errors.amount = undefined
  errors.startDate = undefined
  let ok = true
  if (!Number(form.amount) || Number(form.amount) <= 0) {
    errors.amount = 'Jumlah harus lebih dari 0.'
    ok = false
  }
  if (!form.startDate) {
    errors.startDate = 'Tanggal mulai wajib diisi.'
    ok = false
  }
  return ok
}

function onSubmit() {
  if (!validate()) return
  emit('submit', {
    amount: Number(form.amount),
    category: form.category,
    paymentMethod: form.paymentMethod,
    frequency: form.frequency,
    startDate: new Date(form.startDate).toISOString(),
    endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
    description: form.description,
  })
}
</script>
