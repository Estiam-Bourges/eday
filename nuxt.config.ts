import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: [
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxtjs/seo'
  ],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  auth: {
    baseURL: process.env.AUTH_ORIGIN,
    provider: {
      type: 'local'
    }
  },
  site: {
    name: 'MooCow',
    description: 'La boîte à idées !',
    defaultLocale: 'fr'
  },
  runtimeConfig: {
    authSecret: process.env.NUXT_AUTH_SECRET,
    public: {
      authUrl: process.env.NUXT_AUTH_URL || 'http://localhost:3000'
    }
  }
})