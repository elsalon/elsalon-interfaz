import { defineStore } from 'pinia'
import { useRuntimeConfig } from '#app'

interface Config {
  siteName: string
}

export const useSalonStore = defineStore('salon', {
    state: () => ({
      config: null as Config | null
    }),

    actions: {
      async fetchConfig() {
        try {
          const { data }: any  = await $fetch(useRuntimeConfig().public.apiBase + '/api/config')
          if(data.value){
            this.config = data.value
          }
        } catch (error) {
          console.error('Failed to fetch config:', error)
        }
      }
    }
  })