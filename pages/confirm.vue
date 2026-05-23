<template>
  <div class="text-center">
    <div class="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Mengonfirmasi akun…</h2>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Tunggu sebentar, kamu akan dialihkan otomatis.</p>
  </div>
</template>

<script setup lang="ts">
// Halaman callback setelah konfirmasi email / OAuth.
definePageMeta({ layout: 'auth' })

const user = useSupabaseUser()
const router = useRouter()

watchEffect(() => {
  if (user.value) {
    router.replace('/')
  }
})

// Fallback: jika setelah beberapa detik belum ada sesi, arahkan ke login.
onMounted(() => {
  setTimeout(() => {
    if (!user.value) router.replace('/login')
  }, 4000)
})
</script>
