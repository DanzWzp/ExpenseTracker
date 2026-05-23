<template>
  <div>
    <h2 class="mb-1 text-xl font-semibold text-gray-900 dark:text-white">Buat akun baru</h2>
    <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">Mulai catat pengeluaranmu hari ini ✨</p>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <div>
        <label class="label" for="name">Nama</label>
        <input id="name" v-model="name" type="text" class="input" placeholder="Nama lengkapmu" required />
      </div>

      <div>
        <label class="label" for="email">Email</label>
        <input id="email" v-model="email" type="email" class="input" placeholder="kamu@email.com" autocomplete="email" required />
        <p v-if="emailError" class="form-error">{{ emailError }}</p>
      </div>

      <div>
        <label class="label" for="password">Kata Sandi</label>
        <input
          id="password"
          v-model="password"
          type="password"
          class="input"
          placeholder="Minimal 6 karakter"
          autocomplete="new-password"
          required
        />
        <p v-if="passwordError" class="form-error">{{ passwordError }}</p>
      </div>

      <div>
        <label class="label" for="confirm">Konfirmasi Kata Sandi</label>
        <input id="confirm" v-model="confirm" type="password" class="input" placeholder="Ulangi kata sandi" required />
        <p v-if="confirmError" class="form-error">{{ confirmError }}</p>
      </div>

      <p v-if="errorMsg" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger dark:bg-red-900/30">
        {{ errorMsg }}
      </p>

      <button type="submit" class="btn-primary w-full" :disabled="loading">
        <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        {{ loading ? 'Mendaftar...' : 'Daftar' }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
      Sudah punya akun?
      <NuxtLink to="/login" class="font-medium text-primary hover:underline">Masuk di sini</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { isValidEmail } from '~/utils/validators'

definePageMeta({ layout: 'auth' })

const { register } = useAuth()
const toast = useToast()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const confirm = ref('')
const loading = ref(false)
const errorMsg = ref('')

const emailError = computed(() => (email.value && !isValidEmail(email.value) ? 'Format email tidak valid' : ''))
const passwordError = computed(() => (password.value && password.value.length < 6 ? 'Minimal 6 karakter' : ''))
const confirmError = computed(() => (confirm.value && confirm.value !== password.value ? 'Kata sandi tidak cocok' : ''))

async function onSubmit() {
  errorMsg.value = ''
  if (emailError.value || passwordError.value || confirmError.value) return
  if (!name.value.trim()) {
    errorMsg.value = 'Nama wajib diisi.'
    return
  }

  loading.value = true
  try {
    const data = await register(email.value, password.value, name.value.trim())
    // Jika konfirmasi email diaktifkan di Supabase, session belum ada.
    if (data.session) {
      toast.success('Pendaftaran berhasil. Selamat datang!')
      await router.replace('/')
    } else {
      toast.info('Pendaftaran berhasil. Cek email-mu untuk konfirmasi akun.')
      await router.replace('/login')
    }
  } catch (e: unknown) {
    const msg = (e as { message?: string })?.message ?? ''
    if (/already registered|already exists/i.test(msg)) {
      errorMsg.value = 'Email sudah terdaftar. Silakan masuk.'
    } else {
      errorMsg.value = msg || 'Gagal mendaftar. Coba lagi.'
    }
  } finally {
    loading.value = false
  }
}
</script>
