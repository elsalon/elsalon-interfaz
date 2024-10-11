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
      currContext: null as String | null,
      contextoId: null as String | null,
    }),

    actions: {
      async setContext(context: string, salon: string = ''){
        this.currContext = context;
        this.contextoId = salon;
      },
      async fetchConfig() {
        if(this.initialized) return;
        this.loading = true;
        try {
          // return;
          const runtimeConfig = useRuntimeConfig().public
          const { data }: any  = await useFetch(runtimeConfig.apiBase + "/api/salones?sort=orden$limit=-1")
          if(data.value.docs.length > 0){
            this.salones = data.value.docs.sort((a: any, b: any) => a.orden - b.orden);
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