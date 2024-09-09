import { useSalonStore } from '~/stores/SalonConfig'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const salonStore = useSalonStore()
  
  if (!salonStore.initialized && !salonStore.loading) {
    await salonStore.fetchConfig()
  }
  
  if (!salonStore.initialized && !salonStore.loading) {
    // If still not initialized and not loading, redirect to an error page or login
    console.log("Error fetching salon config")
    return navigateTo('/error')
  }
})