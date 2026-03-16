export default defineNuxtConfig({
  modules: [
    '@nuxtjs/supabase',
    '@nuxtjs/tailwindcss',
    '@vite-pwa/nuxt',  // ← décommenter
  ],

  supabase: {
    redirect: false,
    types: false,
  },

  app: {
    head: {
      link: [
      { rel: 'manifest', href: '/manifest.webmanifest' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap' }
      ],
      script: [
        {
          src: 'https://cdn.kkiapay.me/k.js',
          defer: true,
        }
      ]
    }
  },

  vite: {
  server: {
    allowedHosts: ['all'],
  },
  },

  nitro: {
  preset: 'vercel',
  },

 pwa: {
  registerType: 'autoUpdate',
  manifest: {
    name: 'ExamensBénin',
    short_name: 'Examens',
    description: 'Épreuves et corrigés BEPC, BAC, Concours',
    theme_color: '#1d4ed8',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'fr',
    start_url: '/',
    scope: '/',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  workbox: {
    navigateFallback: '/',
    globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
  },
  devOptions: {
    enabled: true,
    type: 'module',
  },
  },

  runtimeConfig: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
    kkiapayPrivateKey: process.env.KKIAPAY_PRIVATE_KEY,
    kkiapaySecretKey: process.env.KKIAPAY_SECRET_KEY,
    openrouterApiKey: process.env.OPENROUTER_API_KEY,
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_KEY,
      kkiapayPublicKey: process.env.KKIAPAY_PUBLIC_KEY,
      documentPrice: process.env.DOCUMENT_PRICE || '500',
    }
  },
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2024-01-01',
})