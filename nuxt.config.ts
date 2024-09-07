// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [
    '@sidebase/nuxt-auth'
  ],
  // runtimeConfig: {
  //   public: {
  //     authJs: {
  //       baseURL: 'http://localhost:4000'
  //     }
  //   }
  // },
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
      // sessionDataType: {
      //   user: '{id:string,email:string,createdAt:string,updatedAt:string}',
      //   // id: 'string',
      //   // email: 'string',
      //   // createdAt: 'string',
      //   // updatedAt: 'string',
      // },
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
})