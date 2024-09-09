import { defineNuxtPlugin } from '#app'
import { useSalonStore } from '~/stores/SalonConfig'

export default defineNuxtPlugin(async (nuxtApp) => {
    // console.log('Loaded Salon Config Plugin');
    const configStore = useSalonStore()

    // Fetch the config
    // await configStore.fetchConfig()
    // Only fetch if not already initialized or loading
    if (!configStore.initialized && !configStore.loading) {
        configStore.fetchConfig()
    }
})