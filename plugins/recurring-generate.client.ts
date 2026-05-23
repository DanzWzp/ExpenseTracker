// Saat user login, jalankan auto-generate pengeluaran berulang yang jatuh tempo
// satu kali per sesi (idempoten di sisi server).
export default defineNuxtPlugin(() => {
  const user = useSupabaseUser()
  let done = false

  watch(
    user,
    async (u) => {
      if (u && !done) {
        done = true
        try {
          await $fetch('/api/recurring/generate', { method: 'POST' })
        } catch {
          /* abaikan; akan dicoba lagi dari halaman Berulang */
        }
      }
    },
    { immediate: true },
  )
})
