<template>
  <div>
    <!-- Sebelum terkirim: form email -->
    <template v-if="!sent">
      <h2 class="mb-1 text-xl font-semibold text-gray-900 dark:text-white">Lupa kata sandi?</h2>
      <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Masukkan email akunmu. Kami akan mengirim tautan untuk mereset kata sandi.
      </p>

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
          <p v-if="emailError" class="form-error">{{ emailError }}</p>
        </div>

        <p v-if="errorMsg" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger dark:bg-red-900/30">
          {{ errorMsg }}
        </p>

        <button type="submit" class="btn-primary w-full" :disabled="loading">
          <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          {{ loading ? 'Mengirim...' : 'Kirim Tautan Reset' }}
        </button>
      </form>
    </template>

    <!-- Setelah terkirim: instruksi + buka Gmail -->
    <template v-else>
      <div class="text-center">
        <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-3xl dark:bg-green-900/40">
          📧
        </div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Cek email-mu</h2>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Kami telah mengirim tautan reset ke
          <span class="font-medium text-gray-700 dark:text-gray-200">{{ email }}</span>.
          Klik tautan di email tersebut untuk membuat kata sandi baru.
        </p>

        <a
          href="https://mail.google.com/mail/u/0/#search/from%3Anoreply%40mail.app.supabase.io"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-primary mt-6 w-full"
        >
          Buka Gmail
        </a>

        <button class="btn-ghost mt-2 w-full text-sm" :disabled="loading" @click="onSubmit">
          {{ loading ? 'Mengirim ulang...' : 'Kirim ulang tautan' }}
        </button>

        <p class="mt-3 text-xs text-gray-400">Tidak menemukan email? Cek folder Spam/Promosi.</p>
      </div>
    </template>

    <p class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
      <NuxtLink to="/login" class="font-medium text-primary hover:underline">← Kembali ke halaman masuk</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { isValidEmail } from '~/utils/validators'

definePageMeta({ layout: 'auth' })

const { resetPassword } = useAuth()
const toast = useToast()

const email = ref('')
const loading = ref(false)
const sent = ref(false)
const errorMsg = ref('')

const emailError = computed(() => (email.value && !isValidEmail(email.value) ? 'Format email tidak valid' : ''))

async function onSubmit() {
  errorMsg.value = ''
  if (!isValidEmail(email.value)) {
    errorMsg.value = 'Masukkan email yang valid.'
    return
  }
  loading.value = true
  try {
    await resetPassword(email.value)
    sent.value = true
    toast.success('Tautan reset telah dikirim ke email-mu.')
  } catch (e: unknown) {
    errorMsg.value = (e as { message?: string })?.message || 'Gagal mengirim tautan. Coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>
