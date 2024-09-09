import { defineStore } from 'pinia'
import { useRuntimeConfig } from '#app'

interface Config {
  siteName: string
}
interface Salon{
  nombre: string;
  siglas: string;
  color: string;
  slug: string;
}

export const useSalonStore = defineStore('salon', {
    state: () => ({
      config: null as Config | null,
      salones: [] as Salon[],
    }),

    actions: {
      async fetchConfig() {
        try {
          // return;
          const runtimeConfig = useRuntimeConfig().public
          const { docs }: any  = await $fetch(runtimeConfig.apiBase + "/api/salones?sort=orden")
          if(docs.length > 0){
            this.salones = docs
          }
        } catch (error) {
          console.error('Failed to fetch config:', error)
        }
      }
    }
  })