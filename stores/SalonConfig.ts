import { defineStore } from 'pinia'
import { useRuntimeConfig } from '#app'

interface Archivo {
  activar: Boolean;
  frecuencia: String;
  annoInicio: number;
  periodos: Array<object>;
}

interface Salon {
  id: string;
  nombre: string;
  siglas: string;
  color: string;
  slug: string;
  archivo: Archivo;
}

interface Etiqueta {
  id: string;
  nombre: string;
  slug: string;
}

export const useSalonStore = defineStore('salon', {
  state: () => ({
    pageTitle: "Salón",
    etiquetas: [] as Etiqueta[],
    salas: [] as Salon[],
    initialized: false,
    loading: false,
    currContext: null as String | null,
    contextoId: null as String | null,
    // comienzoCuatri1: '01-01', // mes / dia 1 enero
    // finCuatri1: '07-31', // mes / dia 31 julio
    // comienzoCuatri2: '08-01', // mes / dia 1 agosto (aunque sea mas tarde)
    // finCuatri2: '12-31', // mes / dia 31 diciembre
    gruposDelUsuario: null as null,
    gruposDelUsuarioFetching: false,
    invalidating: false,
  }),

  actions: {
    SetPageTitle(title: string) {
      this.pageTitle = title;
    },
    async UpdateSala(salon: Salon) {
      const i = this.salas.findIndex((s) => s.id === salon.id);
      if (i >= 0) {
        this.salas[i] = salon;
      }
    },
    async setContext(context: string, salon: string = '') {
      this.currContext = context;
      this.contextoId = salon;
    },
    
    async fetchConfig() {
      if (this.initialized || this.loading) return;

      this.loading = true;

      try {
        const { data } = await useFetch("/cache/config");

        if (data.value) {
          this.salas = data.value.salas;
          this.etiquetas = data.value.etiquetas;
        }

        this.initialized = true;
      } catch (error) {
        console.error("Error fetching config:", error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Invalidate the cache for a specific sala and update the store
     * @param salaId The ID of the sala to invalidate
     * @returns The result of the invalidation operation
     */
    async invalidateSala(salaId: string) {
      if (this.invalidating) return null;
      
      this.invalidating = true;
      
      try {
        const response = await $fetch(`/cache/invalidate?salaId=${salaId}`);
        
        if (response.success && response.data) {
          // Update the sala in the store directly
          const index = this.salas.findIndex(sala => sala.id === salaId);
          if (index !== -1) {
            this.salas[index] = response.data;
            console.log(`Sala ${salaId} updated in store`);
          }
        }
        
        return response;
      } catch (error) {
        console.error(`Error invalidating sala ${salaId}:`, error);
        throw error;
      } finally {
        this.invalidating = false;
      }
    },

    /**
     * Invalidate the entire cache and refetch all data
     */
    async invalidateAllCache() {
      if (this.invalidating) return null;
      
      this.invalidating = true;
      
      try {
        const response = await $fetch('/cache/invalidate');
        
        if (response.success) {
          // Reset initialized flag to trigger a fresh fetch
          this.initialized = false;
          
          // Refetch all the data
          await this.fetchConfig();
          
          console.log('Cache invalidated and data refreshed');
        }
        
        return response;
      } catch (error) {
        console.error('Error invalidating cache:', error);
        throw error;
      } finally {
        this.invalidating = false;
      }
    },

    async FetchGruposDelUsuario(force = false) {
      // If we need fresh data or don't have cached data, and we're not already fetching
      if ((force || !this.gruposDelUsuario) && !this.gruposDelUsuarioFetching) {
        try {
          this.gruposDelUsuarioFetching = true;
          const { docs: gruposDelUsuario } = await useAPI(`/api/grupos/me`);
          this.gruposDelUsuario = gruposDelUsuario;
        } catch (error) {
          console.error("Error fetching grupos", error);
          throw error;
        } finally {
          this.gruposDelUsuarioFetching = false;
        }
      }
      // If another fetch is already in progress, wait for it to complete
      else if (this.gruposDelUsuarioFetching) {
        await new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (!this.gruposDelUsuarioFetching) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 50);
        });
      }
    }
  },
});
