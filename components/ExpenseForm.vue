<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <!-- Jumlah -->
    <div>
      <label class="label" for="amount">Jumlah (Rp) <span class="text-danger">*</span></label>
      <input
        id="amount"
        v-model="form.amount"
        type="number"
        step="0.01"
        min="0"
        class="input"
        placeholder="0"
        @input="touched.amount = true"
      />
      <p v-if="showError('amount')" class="form-error">{{ errors.amount }}</p>
      <p v-else-if="Number(form.amount) > 0" class="mt-1 text-xs text-gray-500">{{ formatCurrency(Number(form.amount)) }}</p>
    </div>

    <!-- Kategori & Metode pembayaran -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label class="label" for="category">Kategori <span class="text-danger">*</span></label>
        <select id="category" v-model="form.category" class="input">
          <option v-for="c in CATEGORIES" :key="c.value" :value="c.value">{{ c.emoji }} {{ c.label }}</option>
        </select>
      </div>
      <div>
        <label class="label" for="payment">Metode Pembayaran <span class="text-danger">*</span></label>
        <select id="payment" v-model="form.paymentMethod" class="input">
          <option v-for="p in PAYMENT_METHODS" :key="p.value" :value="p.value">{{ p.label }}</option>
        </select>
      </div>
    </div>

    <!-- Tanggal -->
    <div>
      <label class="label" for="date">Tanggal <span class="text-danger">*</span></label>
      <input id="date" v-model="form.date" type="date" class="input" @input="touched.date = true" />
      <p v-if="showError('date')" class="form-error">{{ errors.date }}</p>
    </div>

    <!-- Deskripsi -->
    <div>
      <div class="flex items-center justify-between">
        <label class="label" for="description">Deskripsi</label>
        <span class="text-xs" :class="form.description.length > 500 ? 'text-danger' : 'text-gray-400'">
          {{ form.description.length }}/500
        </span>
      </div>
      <textarea
        id="description"
        v-model="form.description"
        rows="3"
        maxlength="500"
        class="input resize-none"
        placeholder="Contoh: Makan siang di kantor"
      />
      <p v-if="showError('description')" class="form-error">{{ errors.description }}</p>
    </div>

    <p v-if="isCreate && hasDraft" class="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
      📝 Draf otomatis dipulihkan dari sesi sebelumnya.
    </p>

    <div class="flex justify-end gap-2 pt-2">
      <button type="button" class="btn-secondary" @click="$emit('cancel')">Batal</button>
      <button type="submit" class="btn-primary" :disabled="submitting">
        <span v-if="submitting" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        {{ isCreate ? 'Simpan' : 'Perbarui' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { Expense, ExpenseFormData } from '~/types/models'
import { CATEGORIES, PAYMENT_METHODS } from '~/utils/constants'
import { formatCurrency, toDateInput } from '~/utils/formatters'
import { expenseSchema } from '~/utils/validators'

const props = withDefaults(
  defineProps<{ expense?: Expense | null; submitting?: boolean }>(),
  { expense: null, submitting: false },
)

const emit = defineEmits<{ submit: [ExpenseFormData]; cancel: [] }>()

const DRAFT_KEY = 'expense-tracker-draft'
const isCreate = computed(() => !props.expense)
const hasDraft = ref(false)

const form = reactive<ExpenseFormData>({
  amount: '',
  category: 'Food',
  description: '',
  date: toDateInput(new Date()),
  paymentMethod: 'Cash',
})

const touched = reactive<Record<string, boolean>>({})
const submitAttempted = ref(false)

// Inisialisasi: mode edit isi dari data; mode create pulihkan draft bila ada.
onMounted(() => {
  if (props.expense) {
    form.amount = props.expense.amount
    form.category = props.expense.category
    form.description = props.expense.description || ''
    form.date = toDateInput(props.expense.date)
    form.paymentMethod = props.expense.paymentMethod
  } else if (import.meta.client) {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (raw) {
      try {
        Object.assign(form, JSON.parse(raw))
        hasDraft.value = true
      } catch {
        /* abaikan draft rusak */
      }
    }
  }
})

// Auto-save draft (hanya mode create) dengan debounce ringan.
let saveTimer: ReturnType<typeof setTimeout> | null = null
watch(
  form,
  () => {
    if (!isCreate.value || !import.meta.client) return
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
    }, 400)
  },
  { deep: true },
)

const errors = computed<Record<string, string>>(() => {
  const result = expenseSchema.safeParse({
    amount: form.amount,
    category: form.category,
    description: form.description,
    date: form.date,
    paymentMethod: form.paymentMethod,
  })
  if (result.success) return {}
  const flat = result.error.flatten().fieldErrors
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(flat)) {
    if (v && v[0]) out[k] = v[0]
  }
  return out
})

function showError(field: string) {
  return (touched[field] || submitAttempted.value) && errors.value[field]
}

function onSubmit() {
  submitAttempted.value = true
  if (Object.keys(errors.value).length > 0) return

  emit('submit', {
    amount: Number(form.amount),
    category: form.category,
    description: form.description,
    date: new Date(form.date).toISOString(),
    paymentMethod: form.paymentMethod,
  })

  if (isCreate.value && import.meta.client) {
    localStorage.removeItem(DRAFT_KEY)
  }
}
</script>
