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
  secciones: any[];
}

interface Etiqueta {
  id: string;
  nombre: string;
  slug: string;
}

let cache: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 1000 * 60 * 60 * 3; // 3 hours
const runtimeConfig = useRuntimeConfig().public;

export default defineEventHandler(async () => {

  if (cache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    console.log("Returning cached config");
    return cache;
  }
  console.log("Fetching fresh config", runtimeConfig.apiBase + "/api/salas?sort=orden&limit=0&depth=1");

  const [salasRes, etiquetasRes] = await Promise.all([
    $fetch<{ docs: any[] }>(runtimeConfig.apiBase + "/api/salas?sort=orden&limit=0&depth=1"),
    $fetch<{ docs: any[] }>(runtimeConfig.apiBase + "/api/etiquetas"),
  ]);

  let salas, etiquetas;

  const salasData = salasRes.docs || [];
  if (salasData.length > 0) {
    salas = salasData.sort((a: any, b: any) => a.orden - b.orden);
    salas.forEach(async (salon: Salon) => await parseSalaCache(salon));
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

// Make parseSalaCache function available to other modules
export async function parseSalaCache(salon: Salon) {
  await FetchSecciones(salon);
  console.log("Parseando", salon.nombre, "para limpiar campos y agregar periodos");
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

const camposSeccionEliiminar = ['extracto','contenido','imagenes','archivos','embedsYoutube','embedsVimeo']
async function FetchSecciones(sala: Salon){
  console.log("Fetch secciones", sala.nombre);
  console.log(`${runtimeConfig.apiBase}/api/secciones?where[sala][equals]=${sala.id}&depth=0`);
  // TODO Filtrar tambien dentro de periodo
  let secciones = await $fetch<{ docs: any[] }>(`${runtimeConfig.apiBase}/api/secciones?where[sala][equals]=${sala.id}&depth=0`);
  console.log(secciones.docs)
  // Elimino los campos excepto blockType para reducir el tamaño del cache
  secciones.docs?.forEach((seccion: any) => {
    // camposSeccionEliiminar.forEach((campo) => {
    //   delete seccion.componente[0][campo];
    // })
    // seccion.componente[0] = {blockType: seccion.componente[0].blockType};
  });
  sala.secciones = secciones.docs || [];
}