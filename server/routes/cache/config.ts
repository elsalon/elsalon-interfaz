import { defineEventHandler } from 'h3';
import { useRuntimeConfig } from '#imports';
import { setCacheReference } from './invalidate';

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

let cache: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 1000 * 60 * 60 * 3; // 3 hours

export default defineEventHandler(async () => {
  const runtimeConfig = useRuntimeConfig().public;

  if (cache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    console.log("Returning cached config");
    return cache;
  }
  console.log("Fetching fresh config", runtimeConfig.apiBase + "/api/salas?sort=orden&limit=0&depth=1");

  const [salasRes, etiquetasRes] = await Promise.all([
    $fetch(runtimeConfig.apiBase + "/api/salas?sort=orden&limit=0&depth=1"),
    $fetch(runtimeConfig.apiBase + "/api/etiquetas"),
  ]);

  let salas, etiquetas;

  const salasData = salasRes.docs || [];
  if (salasData.length > 0) {
    salas = salasData.sort((a: any, b: any) => a.orden - b.orden);
    salas.forEach((salon: Salon) => crearPeriodos(salon));
  }


  cache = {
    salas: salasRes.docs || [],
    etiquetas: etiquetasRes.docs || [],
  };

  cacheTimestamp = Date.now();
  
  // Share the cache reference with the invalidate endpoint
  setCacheReference(cache, cacheTimestamp);
  
  return cache;
});

const comienzoCuatri1 = '01-01'; // mes / dia 1 enero
const finCuatri1 = '07-31'; // mes / dia 31 julio
const comienzoCuatri2 = '08-01'; // mes / dia 1 agosto (aunque sea mas tarde)
const finCuatri2 = '12-31'; // mes / dia 31 diciembre

// Make crearPeriodos function available to other modules
export function crearPeriodos(salon: Salon) {
  console.log("Creating periods for", salon.nombre, salon.secciones);
  // if(salon.archivo.activar){
  let periodos = []
  let now = new Date();
  let currentYear = now.getFullYear();
  let currentMonth = now.getMonth();
  for (let i = currentYear; i >= salon.archivo.annoInicio; i--) {
    if (salon.archivo.frecuencia == "cuatrimestral") {
      // Materias cuatrimestrales tienen dos periodos por año
      // Solo agrego el periodo 2 de este año si ya paso agosto
      if (i !== currentYear || currentMonth >= 7) {
        periodos.push({
          startDate: new Date(i + '-' + comienzoCuatri2 + "GMT-0300"),
          endDate: new Date(i + '-' + finCuatri2 + "GMT-0300"),
          nombre: i + ' c. 2',
          slug: `${i}-2`,
        })
      }
      periodos.push({
        startDate: new Date(i + '-' + comienzoCuatri1 + "GMT-0300"),
        endDate: new Date(i + '-' + finCuatri1 + "GMT-0300"),
        nombre: i + ' c. 1',
        slug: `${i}-1`,
      })
    } else {
      // Materias anuales tienen un solo periodo por año (default)
      periodos.push({
        startDate: new Date(i + '-' + comienzoCuatri1 + "GMT-0300"),
        endDate: new Date(i + '-' + finCuatri2 + "GMT-0300"),
        nombre: i,
        slug: `${i}`,
      })
    }
    salon.archivo.periodos = periodos;
  }
}
