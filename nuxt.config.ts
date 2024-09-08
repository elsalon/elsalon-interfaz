// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  plugins: [
    '~/plugins/SalonConfig.ts',
  ],
  modules: [
    '@sidebase/nuxt-auth',
    '@pinia/nuxt',
    '@primevue/nuxt-module'
  ],
  
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:4000/',
      configApi: 'api/config',
      entradasApi: 'api/entradas',
    }
  },
  // *****
  // primevue
  // *****
  primevue: {
    options: {
        unstyled: true
    },
    importPT: { as: 'Salon', from: '~/primevue-presets/salon' },    
  },
  // *****
  // AUTH
  // *****
  auth: {
    // https://auth.sidebase.io/guide/local/quick-start
    baseURL: 'http://localhost:4000/',
    provider: {
      type: 'local',
      endpoints: {
        signIn: { path: 'api/users/login', method: 'post' },
        signOut: { path: 'api/users/logout', method: 'post' },
        signUp: { path: 'api/users', method: 'post' },
        getSession: { path: 'api/users/me', method: 'get' }
      },
      token: {
        // maxAgeInSeconds: 60 * 60 * 24 * 30, // 30 days
        signInResponseTokenPointer: '/token',
        type: 'Bearer',
        headerName: 'Authorization'
      },
      // refresh:{
        // todo
      // }
      pages: {
        // adonde redirigir si no está autenticado
        login: '/login'
      },
      
    },
    globalAppMiddleware: true
  },
  // *********
  // TAILWIND
  // *********
  css: ['~/assets/css/main.css', "primeicons/primeicons.css"],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})