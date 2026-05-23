import { computed } from 'vue'

/**
 * Wrapper di atas Supabase Auth untuk signup/login/logout
 * dan akses data user yang sedang login.
 */
export function useAuth() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const isLoggedIn = computed(() => !!user.value)

  const displayName = computed(() => {
    const meta = user.value?.user_metadata as Record<string, unknown> | undefined
    return (meta?.displayName as string) || user.value?.email?.split('@')[0] || 'Pengguna'
  })

  const avatarUrl = computed(() => {
    const meta = user.value?.user_metadata as Record<string, unknown> | undefined
    return (meta?.avatar_url as string) || null
  })

  async function register(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { displayName: name } },
    })
    if (error) throw error
    return data
  }

  async function login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async function updateProfile(payload: {
    displayName?: string
    avatarUrl?: string
    email?: string
    password?: string
  }) {
    const attrs: Parameters<typeof supabase.auth.updateUser>[0] = {}
    if (payload.email) attrs.email = payload.email
    if (payload.password) attrs.password = payload.password
    if (payload.displayName !== undefined || payload.avatarUrl !== undefined) {
      attrs.data = {
        ...(payload.displayName !== undefined ? { displayName: payload.displayName } : {}),
        ...(payload.avatarUrl !== undefined ? { avatar_url: payload.avatarUrl } : {}),
      }
    }
    const { data, error } = await supabase.auth.updateUser(attrs)
    if (error) throw error
    return data
  }

  return {
    user,
    isLoggedIn,
    displayName,
    avatarUrl,
    register,
    login,
    logout,
    updateProfile,
  }
}
