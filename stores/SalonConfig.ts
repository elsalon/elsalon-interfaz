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
  }),

  actions: {
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
      if(salon.archivo.activar){
        let periodos = []
        let now = new Date();
        let currentYear = now.getFullYear();
        let currentMonth = now.getMonth();
        for(let i = currentYear; i >= salon.archivo.annoInicio; i--){
          if(salon.archivo.frecuencia == "anual"){
            // Materias anuales tienen un solo periodo por año
            periodos.push({
              startDate: new Date(i + '-' + this.comienzoCuatri1),
              endDate: new Date(i + '-' + this.finCuatri2),
              nombre: i,
              slug: `${i}`,
            })
          }else if(salon.archivo.frecuencia == "cuatrimestral"){
            // Materias cuatrimestrales tienen dos periodos por año
            // Solo agrego el periodo 2 de este año si ya paso agosto
            if (i !== currentYear || currentMonth >= 7) {
              periodos.push({
                startDate: new Date(i + '-' + this.comienzoCuatri2),
                endDate: new Date(i + '-' + this.finCuatri2),
                nombre: i + ' C. 2',
                slug: `${i}-2`,
              })
            }
            periodos.push({
              startDate: new Date(i + '-' + this.comienzoCuatri1),
              endDate: new Date(i + '-' + this.finCuatri1),
              nombre: i + ' C. 1',
              slug: `${i}-1`,
            })
          }
          salon.archivo.periodos = periodos;
        }
      }
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
          this.salones.forEach((salon: Salon) => this.crearPeriodos(salon));
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
