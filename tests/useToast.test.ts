import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useToast } from '../composables/useToast'

describe('useToast', () => {
  beforeEach(() => {
    // Bersihkan state singleton antar-test.
    const { toasts, remove } = useToast()
    ;[...toasts].forEach((t) => remove(t.id))
  })

  it('menambah toast sesuai tipe', () => {
    const t = useToast()
    t.success('Berhasil')
    t.error('Gagal')
    expect(t.toasts).toHaveLength(2)
    expect(t.toasts[0]).toMatchObject({ type: 'success', message: 'Berhasil' })
    expect(t.toasts[1]).toMatchObject({ type: 'error', message: 'Gagal' })
  })

  it('menghapus toast berdasarkan id', () => {
    const t = useToast()
    const id = t.info('Info')
    expect(t.toasts).toHaveLength(1)
    t.remove(id)
    expect(t.toasts).toHaveLength(0)
  })

  it('menghapus otomatis setelah timeout', () => {
    vi.useFakeTimers()
    const t = useToast()
    t.warning('Peringatan')
    expect(t.toasts).toHaveLength(1)
    vi.advanceTimersByTime(4000)
    expect(t.toasts).toHaveLength(0)
    vi.useRealTimers()
  })
})
