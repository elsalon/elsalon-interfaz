import { defineNuxtPlugin } from '#app'
import { useSalonStore } from '~/stores/SalonConfig'

export default defineNuxtPlugin(async (nuxtApp) => {
    // console.log('Loaded Salon Config Plugin');
    const configStore = useSalonStore()

    // Fetch the config
    await configStore.fetchConfig()
})