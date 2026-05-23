<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
// Inisialisasi mode warna (dark/light) global agar konsisten di semua halaman.
useDarkMode()
</script>
