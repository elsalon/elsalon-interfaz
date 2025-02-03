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
    salones: [] as Salon[],
    initialized: false,
    loading: false,
    currContext: null as String | null,
    contextoId: null as String | null,
    comienzoCuatri1: '01-01', // mes / dia 1 enero
    finCuatri1: '07-31', // mes / dia 31 julio
    comienzoCuatri2: '08-01', // mes / dia 1 agosto (aunque sea mas tarde)
    finCuatri2: '12-31', // mes / dia 31 diciembre
    gruposDelUsuario: null as null,
    gruposDelUsuarioFetching: false,
  }),

  actions: {
    SetPageTitle(title: string) {
      this.pageTitle = title;
    },
    async UpdateSala(salon: Salon) {
      const i = this.salones.findIndex((s) => s.id === salon.id);
      if (i >= 0) {
        this.salones[i] = salon;
      }
    },
    async setContext(context: string, salon: string = '') {
      this.currContext = context;
      this.contextoId = salon;
    },
    crearPeriodos(salon: Salon) {
      // if(salon.archivo.activar){
        let periodos = []
        let now = new Date();
        let currentYear = now.getFullYear();
        let currentMonth = now.getMonth();
        for(let i = currentYear; i >= salon.archivo.annoInicio; i--){
          if(salon.archivo.frecuencia == "cuatrimestral"){
            // Materias cuatrimestrales tienen dos periodos por año
            // Solo agrego el periodo 2 de este año si ya paso agosto
            if (i !== currentYear || currentMonth >= 7) {
              periodos.push({
                startDate: new Date(i + '-' + this.comienzoCuatri2),
                endDate: new Date(i + '-' + this.finCuatri2),
                nombre: i + ' c. 2',
                slug: `${i}-2`,
              })
            }
            periodos.push({
              startDate: new Date(i + '-' + this.comienzoCuatri1),
              endDate: new Date(i + '-' + this.finCuatri1),
              nombre: i + ' c. 1',
              slug: `${i}-1`,
            })
          }else{
            // Materias anuales tienen un solo periodo por año (default)
            periodos.push({
              startDate: new Date(i + '-' + this.comienzoCuatri1),
              endDate: new Date(i + '-' + this.finCuatri2),
              nombre: i,
              slug: `${i}`,
            })
          }
          salon.archivo.periodos = periodos;
        }
      // }
    },

    async fetchConfig() {
      if (this.initialized || this.loading) return;

      this.loading = true;

      try {
        const runtimeConfig = useRuntimeConfig().public;

        // Realiza ambas peticiones en paralelo
        const [salonesRes, etiquetasRes] = await Promise.all([
          useFetch(runtimeConfig.apiBase + "/api/salones?sort=orden&limit=0"),
          useFetch(runtimeConfig.apiBase + "/api/etiquetas"),
        ]);

        // Procesa la respuesta de salones
        const salonesData = salonesRes.data.value?.docs || [];
        if (salonesData.length > 0) {
          this.salones = salonesData.sort((a: any, b: any) => a.orden - b.orden);
          this.salones.forEach((salon: Salon) => this.crearPeriodos(salon));
        }

        // Procesa la respuesta de etiquetas
        const etiquetasData = etiquetasRes.data.value?.docs || [];
        if (etiquetasData.length > 0) {
          this.etiquetas = etiquetasData;
        }

        this.initialized = true;
        // console.log("**", this.salones)

      } catch (error) {
        console.error('Failed to fetch config:', error);
      } finally {
        this.loading = false;
      }
    },
    async FetchGruposDelUsuario(force = false) {
      // If we need fresh data or don't have cached data, and we're not already fetching
      if ((force || !this.gruposDelUsuario) && !this.gruposDelUsuarioFetching) {
        try {
          console.log("Fetching grupos");
          this.gruposDelUsuarioFetching = true;
          const { docs: gruposDelUsuario } = await useAPI(`/api/grupos/me`);
          this.gruposDelUsuario = gruposDelUsuario;
          console.log("Fetched grupos", gruposDelUsuario);
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
