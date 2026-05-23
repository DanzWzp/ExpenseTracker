<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar desktop -->
    <aside class="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-gray-200 dark:border-gray-700 lg:block">
      <AppSidebar />
    </aside>

    <!-- Drawer sidebar mobile -->
    <Transition name="fade">
      <div v-if="sidebarOpen" class="fixed inset-0 z-40 bg-black/50 lg:hidden" @click="sidebarOpen = false" />
    </Transition>
    <Transition name="slide">
      <aside v-if="sidebarOpen" class="fixed inset-y-0 left-0 z-50 w-64 shadow-xl lg:hidden">
        <AppSidebar @navigate="sidebarOpen = false" />
      </aside>
    </Transition>

    <!-- Konten utama -->
    <div class="lg:pl-64">
      <AppNavbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <main class="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const sidebarOpen = ref(false)
const route = useRoute()

// Tutup drawer saat berpindah halaman.
watch(() => route.path, () => (sidebarOpen.value = false))
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
