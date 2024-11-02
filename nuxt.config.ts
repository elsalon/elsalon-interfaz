// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  plugins: [
    '~/plugins/api.ts',
    '~/plugins/SalonConfig.ts',
  ],
  modules: [
    '@sidebase/nuxt-auth',
    '@pinia/nuxt',
    '@primevue/nuxt-module'
  ],
  
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:3000',
      configApi: '/api/config',
      entradasApi: '/api/entradas',
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
    baseURL: process.env.NUXT_PUBLIC_API_BASE + "/",
    provider: {
      type: 'local',
      endpoints: {
        signIn: { path: 'api/users/login', method: 'post' },
        signOut: { path: 'api/users/logout', method: 'post' },
        signUp: { path: 'api/users', method: 'post' },
        getSession: { path: 'api/users/me', method: 'get' }
      },
      token: {
        maxAgeInSeconds: 60 * 60 * 24 * 15, // 15 days
        signInResponseTokenPointer: '/token',
        type: 'Bearer',
        headerName: 'Authorization'
      },
      // refresh:{
      //   isEnabled: false,
      //   endpoint: {
      //     path: 'api/users/refresh-token',
      //     method: 'post',
      //   },
      //   token:{
      //     signInResponseRefreshTokenPointer: "/refreshedToken",
      //   }
      // },
      pages: {
        // adonde redirigir si no está autenticado
        login: '/login',
      },
      
    },
    sessionRefresh:{
      enableOnWindowFocus: false,
      // every hour in ms: 
      enablePeriodically: 60 * 60 * 1000, // cada cuanto tiempo se refresca la sesion en ms
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