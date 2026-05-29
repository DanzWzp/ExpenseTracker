<template>
  <div>
    <h2 class="mb-1 text-xl font-semibold text-gray-900 dark:text-white">Masuk ke akunmu</h2>
    <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">Selamat datang kembali! 👋</p>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <div>
        <label class="label" for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          class="input"
          placeholder="kamu@email.com"
          autocomplete="email"
          required
        />
      </div>

      <div>
        <div class="flex items-center justify-between">
          <label class="label" for="password">Kata Sandi</label>
          <NuxtLink to="/forgot-password" class="mb-1 text-xs font-medium text-primary hover:underline">
            Lupa sandi?
          </NuxtLink>
        </div>
        <div class="relative">
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            class="input pr-10"
            placeholder="••••••••"
            autocomplete="current-password"
            required
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            @click="showPassword = !showPassword"
          >
            <component :is="showPassword ? EyeSlashIcon : EyeIcon" class="h-5 w-5" />
          </button>
        </div>
      </div>

      <p v-if="errorMsg" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger dark:bg-red-900/30">
        {{ errorMsg }}
      </p>

      <button type="submit" class="btn-primary w-full" :disabled="loading">
        <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        {{ loading ? 'Memproses...' : 'Masuk' }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
      Belum punya akun?
      <NuxtLink to="/register" class="font-medium text-primary hover:underline">Daftar sekarang</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

definePageMeta({ layout: 'auth' })

const { login } = useAuth()
const toast = useToast()
const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')

// Jika sudah login, langsung ke dashboard.
const user = useSupabaseUser()
watchEffect(() => {
  if (user.value) router.replace('/')
})

async function onSubmit() {
  errorMsg.value = ''
  loading.value = true
  try {
    await login(email.value, password.value)
    toast.success('Berhasil masuk. Selamat datang kembali!')
    await router.replace('/')
  } catch (e: unknown) {
    errorMsg.value = mapAuthError(e)
  } finally {
    loading.value = false
  }
}

function mapAuthError(e: unknown): string {
  const msg = (e as { message?: string })?.message ?? ''
  if (/invalid login credentials/i.test(msg)) return 'Email atau kata sandi salah.'
  if (/email not confirmed/i.test(msg)) return 'Email belum dikonfirmasi. Cek inbox-mu.'
  return msg || 'Gagal masuk. Coba lagi.'
}
</script>
