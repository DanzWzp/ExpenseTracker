// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase', '@vueuse/nuxt'],

  css: ['~/assets/css/main.css'],

  // Konfigurasi Supabase Auth + Realtime
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
    // Redirect otomatis untuk route yang dilindungi
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      // Halaman yang boleh diakses tanpa login
      exclude: ['/register', '/confirm'],
    },
  },

  app: {
    head: {
      title: 'Expense Tracker — Kelola Keuanganmu',
      htmlAttrs: { lang: 'id' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Aplikasi pencatat pengeluaran modern: kelola pengeluaran, anggaran, dan target keuangan dengan mudah.',
        },
      ],
    },
  },

  runtimeConfig: {
    // Server-only (tidak terekspos ke client)
    databaseUrl: process.env.DATABASE_URL,
    public: {
      appName: 'Expense Tracker',
      currency: 'IDR',
      locale: 'id-ID',
    },
  },

  typescript: {
    strict: true,
  },
})
