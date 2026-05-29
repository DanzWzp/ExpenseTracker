// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase', '@vueuse/nuxt', '@vite-pwa/nuxt'],

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
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        {
          name: 'description',
          content:
            'Aplikasi pencatat pengeluaran modern: kelola pengeluaran, anggaran, dan target keuangan dengan mudah.',
        },
        // Meta khusus PWA / mobile
        { name: 'theme-color', content: '#3B82F6' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'Expense Tracker' },
      ],
    },
  },

  // Progressive Web App (installable di Android/desktop)
  pwa: {
    registerType: 'autoUpdate',
    // Ikon di-generate otomatis dari public/logo.svg
    pwaAssets: {
      preset: 'minimal-2023',
      image: 'public/logo.svg',
    },
    manifest: {
      name: 'Expense Tracker — Kelola Keuanganmu',
      short_name: 'Expense Tracker',
      description: 'Catat pengeluaran, anggaran, dan target keuangan dengan mudah.',
      lang: 'id',
      dir: 'ltr',
      theme_color: '#3B82F6',
      background_color: '#F9FAFB',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      categories: ['finance', 'productivity'],
    },
    workbox: {
      // Aplikasi SSR: arahkan navigasi offline ke shell, cache aset statis.
      navigateFallback: '/',
      navigateFallbackDenylist: [/^\/api\//],
      globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
    },
    client: {
      installPrompt: true,
    },
    // Aktifkan SW saat `npm run dev` agar PWA bisa diuji lokal.
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallback: '/',
      type: 'module',
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
