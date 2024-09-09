import { defineStore } from 'pinia'
import { useRuntimeConfig } from '#app'


interface Salon{
  id: string;
  nombre: string;
  siglas: string;
  color: string;
  slug: string;
}

export const useSalonStore = defineStore('salon', {
    state: () => ({
      salones: [] as Salon[],
      initialized: false,
      loading: false,
    }),

    actions: {
      async fetchConfig() {
        if(this.initialized) return;
        this.loading = true;
        try {
          // return;
          const runtimeConfig = useRuntimeConfig().public
          const { data }: any  = await useFetch(runtimeConfig.apiBase + "/api/salones?sort=orden$limit=-1")
          if(data.value.docs.length > 0){
            this.salones = data.value.docs;
            this.initialized = true
          }
        } catch (error) {
          console.error('Failed to fetch config:', error)
        } finally {
          this.loading = false;
        }
      }
    }
  })