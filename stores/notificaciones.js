// stores/notifications.ts
import qs from 'qs'
export const useNotificacionesStore = defineStore('notificaciones', {
  state: () => ({
    dialogVisible: false,

    notificaciones: [],
    totalNotificaciones: 0,

    nuevas: null,
    fetching: false,

    isPolling: false,
    pollingInterval: null,
  }),

  actions: {


    async fetchNotificacionesNuevas() {
      if(this.dialogVisible){
        // Fetch todas
        console.log("TODO")
      }else{
        // Solo la cantidad
        console.log("Fetch nuevas")
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

    async fetchNotificacionesTodas(from = new Date()) {
      const user = useAuth().data.value.user; // Access the user data

      this.fetching = true
      const query = {
        sort: '-updatedAt',
        limit: 5,
        depth: 3,
        where: {
          and: [
            { autor: { equals: user.id } },
            { updatedAt: { less_than: from } },
          ]
        }
      }
      const queryParams = qs.stringify(query, { encode: false })
      const {docs, totalDocs} = await useAPI(`/api/notificaciones?${queryParams}`)
      
      if(this.notificaciones == null){
        this.notificaciones = docs
      }else{
        this.notificaciones.push(...docs)
      }
      // Remove duplicate
      this.notificaciones = this.notificaciones.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i)
      console.log({totalDocs})
      this.totalNotificaciones = totalDocs
      this.fetching = false
      this.resetNotificacionesNuevas()
    },

    async fetchNotificacionesMas() {
      const ultimaNotificacion = this.notificaciones[this.notificaciones.length - 1]
      if (!ultimaNotificacion) return
      this.fetchNotificacionesTodas(ultimaNotificacion.updatedAt)
    },


    async MarcarTodasLeidas() {
      console.log('Marcar todas leidas')
      // await useAPI(`/api/notificaciones/todasleidas`, { method: 'PATCH' })
      // notificaciones.value.forEach(n => n.leida = true)
    },

    startPolling() {
      if (this.isPolling) return
      const frecuenciaSegundos = 10
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

// TODO
// listen for notificacionesNuevas change
// let firstRun = true;
// watch(notificacionesNuevas, (val) => {
//     if(val > 0){
//         if(firstRun){
//             firstRun = false;
//             return;
//         }
//         console.log('Nuevas notificaciones', val)
//         toast.add({ severity: 'contrast', detail: 'Tenés nuevas notificaciones', life: 3000});
//     }
// });