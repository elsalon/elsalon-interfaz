// stores/notifications.ts
import qs from 'qs'
export const useNotificacionesStore = defineStore('notificaciones', {
  state: () => ({
    dialogVisible: false,

    notificaciones: [],
    restantes: 0,

    nuevas: null,
    fetching: false,

    isPolling: false,
    pollingInterval: null,
  }),

  actions: {
    async fetchNotificacionesNuevas() {
      if (this.dialogVisible) {
        // Fetch todas
        const { result } = await useAPI('/api/notificaciones/nuevas?includeDocs=true')
        this.MergeNotificaciones(result.docs)
        this.nuevas = 0
      } else {
        // Solo la cantidad
        const { result } = await useAPI('/api/notificaciones/nuevas')
        this.nuevas = result.totalDocs
      }
    },

    async resetNotificacionesNuevas() {
      if (this.nuevas === 0) return
      const res = await useAPI('/api/notificaciones/resetnuevas', { method: 'PATCH' })
      console.log('Notificaciones nuevas reseteadas', res)
      this.nuevas = 0
    },

    async fetchNotificacionesTodas(fromDate = new Date()) {
      const user = useAuth().data.value.user; // Access the user data
      const limit = 5

      this.fetching = true
      const query = {
        sort: '-updatedAt',
        limit,
        depth: 3,
        where: {
          and: [
            { autor: { equals: user.id } },
            { updatedAt: { less_than_equal: fromDate } },
          ]
        }
      }
      const queryParams = qs.stringify(query, { encode: false })
      const { docs, totalDocs } = await useAPI(`/api/notificaciones?${queryParams}`)
      this.MergeNotificaciones(docs)
      this.restantes = totalDocs - docs.length;
      this.fetching = false
    },

    MergeNotificaciones(docs) {
      if (this.notificaciones == null) {
        this.notificaciones = docs
      } else {
        this.notificaciones.push(...docs)
      }
      // Remove duplicate
      this.notificaciones = this.notificaciones.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i)
      // sort updatedAt
      this.notificaciones.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    },

    async fetchNotificacionesMas() {
      const ultimaNotificacion = this.notificaciones[this.notificaciones.length - 1]
      if (!ultimaNotificacion) return
      this.fetchNotificacionesTodas(new Date(ultimaNotificacion.updatedAt))
    },


    async MarcarTodasLeidas() {
      console.log('Marcar todas leidas')
      await useAPI(`/api/notificaciones/todasleidas`, { method: 'PATCH' })
      this.notificaciones.value.forEach(n => n.leida = true)
    },

    startPolling() {
      if (this.isPolling) return
      const frecuenciaSegundos = 60
      this.isPolling = true
      this.fetchNotificacionesNuevas() // Initial fetch

      this.pollingInterval = setInterval(() => {
        this.fetchNotificacionesNuevas()
      }, frecuenciaSegundos * 1000)
    },

    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval)
        this.pollingInterval = null
      }
      this.isPolling = false
    }
  },
})

// plugin/notifications.ts
export default defineNuxtPlugin((nuxtApp) => {
  const store = useNotificationsStore()
  store.startPolling()

  // Clean up on app unmount
  nuxtApp.hook('app:beforeMount', () => {
    store.stopPolling()
  })
})