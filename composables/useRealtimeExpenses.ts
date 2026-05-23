import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Subscribe perubahan tabel `expenses` milik user via Supabase Realtime.
 * Memerlukan: Realtime diaktifkan untuk tabel + RLS policy SELECT (lihat supabase/realtime-setup.sql).
 *
 * @param onChange dipanggil saat ada INSERT/UPDATE/DELETE dengan tipe event-nya.
 */
export function useRealtimeExpenses(onChange: (eventType: string) => void) {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  let channel: RealtimeChannel | null = null

  function subscribe() {
    if (!user.value || channel) return
    channel = supabase
      .channel(`expenses-changes-${user.value.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses', filter: `userId=eq.${user.value.id}` },
        (payload: { eventType: string }) => {
          onChange(payload.eventType)
        },
      )
      .subscribe()
  }

  function unsubscribe() {
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
    }
  }

  onMounted(subscribe)
  onUnmounted(unsubscribe)
  watch(user, (u) => {
    if (u) subscribe()
    else unsubscribe()
  })

  return { subscribe, unsubscribe }
}
