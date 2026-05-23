<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-blue-100 px-4 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl text-white shadow-lg">
          💰
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Expense Tracker</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Kelola keuanganmu dengan mudah</p>
      </div>
      <div class="card sm:p-8">
        <slot />
      </div>
      <p class="mt-6 text-center text-xs text-gray-400">
        © {{ new Date().getFullYear() }} Expense Tracker. Semua data tersimpan aman.
      </p>
    </div>
  </div>
</template>
