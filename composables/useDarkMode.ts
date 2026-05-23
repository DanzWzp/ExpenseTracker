import { computed } from 'vue'

/** Toggle & state mode gelap, tersimpan di localStorage (via VueUse useColorMode). */
export function useDarkMode() {
  const mode = useColorMode({
    attribute: 'class',
    selector: 'html',
    storageKey: 'expense-tracker-theme',
  })

  const isDark = computed(() => mode.value === 'dark')

  function toggle() {
    mode.value = isDark.value ? 'light' : 'dark'
  }

  return { mode, isDark, toggle }
}
