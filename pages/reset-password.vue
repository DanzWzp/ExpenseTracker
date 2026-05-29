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
      <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
        <template v-if="email">Untuk akun <span class="font-medium text-gray-700 dark:text-gray-200">{{ email }}</span>. </template>
        Masukkan kata sandi baru untuk akunmu.
      </p>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="label" for="password">Kata Sandi Baru</label>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="show ? 'text' : 'password'"
              class="input pr-10"
              placeholder="Minimal 6 karakter"
              autocomplete="new-password"
              required
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              @click="show = !show"
            >
              <component :is="show ? EyeSlashIcon : EyeIcon" class="h-5 w-5" />
            </button>
          </div>
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

        <button
          type="submit"
          class="btn-primary w-full"
          :disabled="loading || !!passwordError || !!confirmError || !password || !confirm"
        >
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
        {{ linkError || 'Tautan reset mungkin sudah kedaluwarsa atau pernah dipakai. Silakan minta tautan baru.' }}
      </p>
      <NuxtLink to="/forgot-password" class="btn-primary mt-6 w-full">Minta Tautan Baru</NuxtLink>
      <NuxtLink to="/login" class="mt-2 block text-sm font-medium text-primary hover:underline">Kembali ke masuk</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

definePageMeta({ layout: 'auth' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const checking = ref(true)
const ready = ref(false)
const linkError = ref('')
const password = ref('')
const confirm = ref('')
const show = ref(false)
const loading = ref(false)
const errorMsg = ref('')

const email = computed(() => user.value?.email ?? '')
const passwordError = computed(() => (password.value && password.value.length < 6 ? 'Minimal 6 karakter' : ''))
const confirmError = computed(() => (confirm.value && confirm.value !== password.value ? 'Kata sandi tidak cocok' : ''))

function markReady() {
  ready.value = true
  checking.value = false
}

// Sesi pemulihan terbentuk (lewat user ref) → tampilkan form.
watchEffect(() => {
  if (user.value) markReady()
})

// Cari pesan error yang dikirim Supabase di query (?error=) atau hash (#error=).
function readLinkError(): string {
  if (route.query.error_description) return String(route.query.error_description)
  if (route.query.error) return String(route.query.error)
  if (import.meta.client && window.location.hash) {
    const h = new URLSearchParams(window.location.hash.slice(1))
    return h.get('error_description') || h.get('error') || ''
  }
  return ''
}

let stopAuthListener: (() => void) | null = null

onMounted(async () => {
  // Tangkap error tautan (mis. kedaluwarsa) → langsung tampilkan state gagal.
  const err = readLinkError()
  if (err) {
    linkError.value = err.replace(/\+/g, ' ')
    checking.value = false
    return
  }

  // Dengarkan event pemulihan Supabase (cara paling andal mendeteksi tautan reset).
  const { data } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
      markReady()
    }
  })
  stopAuthListener = () => data.subscription.unsubscribe()

  // Alur PKCE: tukar ?code= menjadi sesi pemulihan.
  try {
    const code = route.query.code as string | undefined
    if (code) await supabase.auth.exchangeCodeForSession(code)
    // Alur implicit (token di hash) ditangani otomatis oleh detectSessionInUrl.
  } catch {
    /* status sesi diperiksa di bawah */
  }

  // Fallback: jika setelah beberapa detik belum ada sesi, anggap tautan tidak valid.
  setTimeout(() => {
    checking.value = false
  }, 2500)
})

onUnmounted(() => {
  stopAuthListener?.()
})

async function onSubmit() {
  errorMsg.value = ''
  if (password.value.length < 6 || password.value !== confirm.value) return
  loading.value = true
  try {
    const { error } = await supabase.auth.updateUser({ password: password.value })
    if (error) throw error
    toast.success('Kata sandi berhasil diperbarui. Selamat datang kembali!')
    await router.replace('/')
  } catch (e: unknown) {
    errorMsg.value = (e as { message?: string })?.message || 'Gagal menyimpan kata sandi. Coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>
