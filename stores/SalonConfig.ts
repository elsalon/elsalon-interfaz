import { defineStore } from 'pinia'
import { useRuntimeConfig } from '#app'

interface Salon {
  id: string;
  nombre: string;
  siglas: string;
  color: string;
  slug: string;
}

interface Etiqueta {
  id: string;
  nombre: string;
  slug: string;
}

export const useSalonStore = defineStore('salon', {
  state: () => ({
    etiquetas: [] as Etiqueta[],
    salones: [] as Salon[],
    initialized: false,
    loading: false,
    currContext: null as String | null,
    contextoId: null as String | null,
  }),

  actions: {
    async setContext(context: string, salon: string = '') {
      this.currContext = context;
      this.contextoId = salon;
    },

    async fetchConfig() {
      if (this.initialized) return;

      this.loading = true;

      try {
        const runtimeConfig = useRuntimeConfig().public;

        // Realiza ambas peticiones en paralelo
        const [salonesRes, etiquetasRes] = await Promise.all([
          useFetch(runtimeConfig.apiBase + "/api/salones?sort=orden&limit=-1"),
          useFetch(runtimeConfig.apiBase + "/api/etiquetas"),
        ]);

        // Procesa la respuesta de salones
        const salonesData = salonesRes.data.value?.docs || [];
        if (salonesData.length > 0) {
          this.salones = salonesData.sort((a: any, b: any) => a.orden - b.orden);
        }

        // Procesa la respuesta de etiquetas
        const etiquetasData = etiquetasRes.data.value?.docs || [];
        if (etiquetasData.length > 0) {
          this.etiquetas = etiquetasData;
        }

        // Establece 'initialized' solo si ambos conjuntos de datos se cargan correctamente
        if (this.salones.length > 0 && this.etiquetas.length > 0) {
          this.initialized = true;
        }

      } catch (error) {
        console.error('Failed to fetch config:', error);
      } finally {
        this.loading = false;
      }
    },
  },
});
