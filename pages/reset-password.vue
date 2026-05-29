<template>
  <div>
    <!-- Memverifikasi tautan -->
    <div v-if="checking" class="text-center">
      <div class="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p class="text-sm text-gray-500 dark:text-gray-400">Memverifikasi tautan reset…</p>
    </div>

    <!-- Tautan valid: form kata sandi baru -->
    <template v-else-if="ready">
      <h2 class="mb-1 text-xl font-semibold text-gray-900 dark:text-white">Buat kata sandi baru</h2>
      <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">Masukkan kata sandi baru untuk akunmu.</p>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="label" for="password">Kata Sandi Baru</label>
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
          <input
            id="confirm"
            v-model="confirm"
            type="password"
            class="input"
            placeholder="Ulangi kata sandi baru"
            autocomplete="new-password"
            required
          />
          <p v-if="confirmError" class="form-error">{{ confirmError }}</p>
        </div>

        <p v-if="errorMsg" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger dark:bg-red-900/30">
          {{ errorMsg }}
        </p>

        <button type="submit" class="btn-primary w-full" :disabled="loading || !!passwordError || !!confirmError || !password">
          <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          {{ loading ? 'Menyimpan...' : 'Simpan Kata Sandi' }}
        </button>
      </form>
    </template>

    <!-- Tautan tidak valid / kedaluwarsa -->
    <div v-else class="text-center">
      <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-3xl dark:bg-red-900/40">
        ⚠️
      </div>
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Tautan tidak valid</h2>
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Tautan reset mungkin sudah kedaluwarsa atau pernah dipakai. Silakan minta tautan baru.
      </p>
      <NuxtLink to="/forgot-password" class="btn-primary mt-6 w-full">Minta Tautan Baru</NuxtLink>
      <NuxtLink to="/login" class="mt-2 block text-sm font-medium text-primary hover:underline">Kembali ke masuk</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const checking = ref(true)
const ready = ref(false)
const password = ref('')
const confirm = ref('')
const loading = ref(false)
const errorMsg = ref('')

const passwordError = computed(() => (password.value && password.value.length < 6 ? 'Minimal 6 karakter' : ''))
const confirmError = computed(() => (confirm.value && confirm.value !== password.value ? 'Kata sandi tidak cocok' : ''))

// Sesi pemulihan terbentuk → tampilkan form.
watchEffect(() => {
  if (user.value) {
    ready.value = true
    checking.value = false
  }
})

onMounted(async () => {
  try {
    // Alur PKCE: tukar ?code= menjadi sesi pemulihan.
    const code = route.query.code as string | undefined
    if (code) {
      await supabase.auth.exchangeCodeForSession(code)
    }
    // Alur implicit (token di hash) ditangani otomatis oleh detectSessionInUrl.
  } catch {
    /* abaikan; status sesi diperiksa di bawah */
  }
  // Beri waktu sesi terbentuk, lalu hentikan status "memverifikasi".
  setTimeout(() => {
    checking.value = false
  }, 2000)
})

async function onSubmit() {
  errorMsg.value = ''
  if (password.value.length < 6 || password.value !== confirm.value) return
  loading.value = true
  try {
    const { error } = await supabase.auth.updateUser({ password: password.value })
    if (error) throw error
    toast.success('Kata sandi berhasil diperbarui.')
    await router.replace('/')
  } catch (e: unknown) {
    errorMsg.value = (e as { message?: string })?.message || 'Gagal menyimpan kata sandi. Coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>
