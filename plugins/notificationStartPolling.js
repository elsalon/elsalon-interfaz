export default defineNuxtPlugin((nuxtApp) => {
    if (import.meta.server) return

    const store = useNotificacionesStore()
    
    // Start polling only after client is ready
    onNuxtReady(() => {
        store.startPolling()
    })
    
    // Clean up on app unmount
    nuxtApp.hook('app:beforeClose', () => {
      store.stopPolling()
    })
})