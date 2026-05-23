import { reactive } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: number
  type: ToastType
  message: string
}

// State global (client-side) untuk notifikasi toast.
const state = reactive<{ items: Toast[] }>({ items: [] })
let counter = 0

export function useToast() {
  function push(type: ToastType, message: string, timeout = 4000) {
    const id = ++counter
    state.items.push({ id, type, message })
    if (timeout > 0) {
      setTimeout(() => remove(id), timeout)
    }
    return id
  }

  function remove(id: number) {
    const i = state.items.findIndex((t) => t.id === id)
    if (i !== -1) state.items.splice(i, 1)
  }

  return {
    toasts: state.items,
    success: (m: string) => push('success', m),
    error: (m: string) => push('error', m),
    info: (m: string) => push('info', m),
    warning: (m: string) => push('warning', m),
    remove,
  }
}
