// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  plugins: [
    '~/plugins/api.ts',
    '~/plugins/notificationStartPolling.js',
    { src: '~/plugins/plyr.js', mode: 'client' },
  ],
  modules: [
    '@sidebase/nuxt-auth',
    '@pinia/nuxt',
    '@primevue/nuxt-module',
    'mixpanel-nuxt',
    '@samk-dev/nuxt-vcalendar',
  ],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
    }
  },
  // *****
  // Mixpanel Analytics
  // *****
  mixpanel: {
    config:{
      debug: true,
      ignore_dnt: true,
      persistence: 'localStorage',
    }
  },
  // *****
  // primevue
  // *****
  primevue: {
    options: {
        unstyled: true,
        locale: {
          accept: 'Aceptar',
          reject: 'Cancelar',
          choose: 'Elegir',
          upload: 'Subir',
          cancel: 'Cancelar',
          dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
          dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
          dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
          monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
          monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
          today: 'Hoy',
          weekHeader: 'Semana',
          firstDayOfWeek: 1,
          dateFormat: 'dd/mm/yy',
          weak: 'Débil',
          medium: 'Medio',
          strong: 'Fuerte',
          passwordPrompt: 'Introduzca una contraseña',
          emptyFilterMessage: 'No se encontraron resultados',
          emptyMessage: 'No hay opciones disponibles',
          invalid: 'Valor no válido',
          required: 'Campo requerido',
          pattern: 'Patrón no válido',
          number: 'Valor debe ser un número',
          email: 'Email no válido',
          minLength: 'Valor es muy corto',
          maxLength: 'Valor es muy largo',
          invalidDateMessage: 'Fecha no válida',
          clear: 'Limpiar',
          aria: {
            month: 'Mes',
            year: 'Año',
            hour: 'Hora',
            minute: 'Minuto',
            day: 'Día',
            date: 'Fecha',
            time: 'Tiempo',
            daterange: 'Rango de fechas',
            monthSelect: 'Seleccione un mes',
            yearSelect: 'Seleccione un año',
            today: 'Hoy',
            week: 'Semana',
            calendar: 'Calendario',
            edit: 'Editar',
          }
        }
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
  css: ['~/assets/css/main.css', 'primeicons/primeicons.css', 'plyr/dist/plyr.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})