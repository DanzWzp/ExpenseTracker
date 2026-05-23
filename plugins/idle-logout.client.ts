// Logout otomatis setelah 1 jam tidak ada aktivitas (sesuai spesifikasi).
export default defineNuxtPlugin(() => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const toast = useToast()
  const router = useRouter()

  const TIMEOUT = 60 * 60 * 1000 // 1 jam
  let timer: ReturnType<typeof setTimeout> | null = null

  function resetTimer() {
    if (timer) clearTimeout(timer)
    if (!user.value) return
    timer = setTimeout(async () => {
      await supabase.auth.signOut()
      toast.info('Sesi berakhir karena tidak ada aktivitas. Silakan masuk lagi.')
      router.replace('/login')
    }, TIMEOUT)
  }

  const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const
  events.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }))

  watch(user, resetTimer, { immediate: true })
})
