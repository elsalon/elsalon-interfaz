<template>
  <NotificacionEntradasNuevas ref="notifEntradasNuevas" />

  <!-- Empty State -->
  <div v-if="listaEntradas.length === 0" class="text-center text-gray-500 text-sm">
    <!-- CTA Primera publicacion -->
      <p class="my-10 text-gray-500">Todavía no hay entradas en esta sala</p>
      <!-- <Button label="+ Escribir primera entrada" @click="visible=true" class="mb-10"/> -->
  </div>

  <!-- Content -->
  <div v-else class="space-y-10">
    <Entrada v-for="entrada in listaEntradas" :key="entrada.id" :entrada="entrada"
      @eliminar="EliminarEntrada(entrada.id)" :ref="(el) => setEntradaRef(el, entrada.id)" />

    <!-- Loading Indicator -->
  <div v-if="loading" class="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-gray-500 text-sm flex items-center">
    <span class="spinner mr-2"></span> Cargando...
  </div>
    <!-- Pagination Status -->
    <div v-show="!hasNextPage" class="h-10 text-center text-gray-500 text-sm">
      No hay más entradas
    </div>
  </div>

  <!-- Intersection observer target -->
  <div ref="observerTarget" class="h-4"></div>

</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAsyncData } from "#app";
import qs from 'qs';
const notifEntradasNuevas = ref(null);
const SalonStore = useSalonStore();
const hasNextPage = ref(false);

// Props
const props = defineProps({
  query: { type: Object, default: {} },
  apiUrl: { type: String, default: '/api/entradas' },
  cacheKey: { type: String, default: null },
  saltearFijadas: { type: Boolean, default: false },
});

// States
const page = ref(1);
const idsEntradasFijadas = ref([]);
const entradasFijadas = ref([]);
const entradasPaginadas = ref([]);
const loading = ref(false);
const observerTarget = ref(null)

const entradaRefs = ref({});

function setEntradaRef(el, id) {
  if (el) {
    entradaRefs.value[id] = el;
  }
}
// Hooks
const { hooks } = useNuxtApp()
let OnCreateEntryHook = null;

// Fetch inicial de entradas
const queryParams = qs.stringify({
  depth: 2,
  page: page.value,
  sort: '-createdAt',
  ...props.query,
}, { encode: false })
const { data: entradas } = await useAsyncData(props.cacheKey, () => useAPI(`${props.apiUrl}?${queryParams}`))
entradasPaginadas.value = entradas.value.docs;
hasNextPage.value = entradas.value.hasNextPage;

// Fetch inicial de fijadas

if(!props.saltearFijadas){
  const cacheKey = `${props.cacheKey}:fijadas`;
  const { data: entradasFijadasRes } = await useAsyncData(cacheKey, () => useAPI('/api/fijadas', {
    params: {
      depth: 4,
      "where[contexto][equals]=": SalonStore.contextoId,
      sort: '-createdAt',
      limit: 10
    }
  }))
  idsEntradasFijadas.value = [];
  entradasFijadasRes.value.docs.forEach(item => {
    if (item.entrada.id != undefined){
      idsEntradasFijadas.value.push(item.entrada.id)
      item.entrada.fijada = item.id; // le agrego el id de la fijada a la entrada
    }
  })
  // console.log(entradasFijadasRes.value)
  entradasFijadas.value = entradasFijadasRes.value.docs.map(item => item.entrada);
}

const listaEntradas = computed(() => {
  if (!entradasFijadas.value || !entradasPaginadas.value) return [];
  const filteredEntries = entradasPaginadas.value.filter(entry => !idsEntradasFijadas.value.includes(entry.id));
  return [...entradasFijadas.value, ...filteredEntries];
})


// Fetch paginated entries
const fetchItems = async (pageNum) => {
  loading.value = true
  const queryParams = qs.stringify({
  depth: 2,
  page: page.value,
  sort: '-createdAt',
  ...props.query,
}, { encode: false })
  try {
    const res = await useAPI(`${props.apiUrl}?${queryParams}`)
    console.log('Fetched items:', res)
    hasNextPage.value = res.hasNextPage

    // Append new items to existing array
    entradasPaginadas.value = [...entradasPaginadas.value, ...res.docs]
  } catch (error) {
    console.error('Error fetching items:', error)
  } finally {
    loading.value = false
  }
}

// Intersection Observer callback
const handleIntersect = async (entries) => {
  const entry = entries[0]
  if (entry.isIntersecting && hasNextPage.value && !loading.value) {
    page.value++
    await fetchItems(page.value)
  }
}

const FetchBatchAprecios = async (entradas) => {
  if(entradas.length === 0) return
  const ids = entradas.map(entrada => entrada.id).join(',')
  const aprecios = await useAPI('/api/aprecio/batch', {
    params: { ids }
  })
  console.log('Fetched batch aprecios:', aprecios)
  aprecios.forEach(aprecio => {
    const entrada = entradas.find(item => item.id === aprecio.contenidoid)
    if (entrada) {
      entrada.aprecioIniciales = aprecio
    }
  })
}

const FetchNewerFromDate = async (date) => {
  console.log('Fetching newer items from:', date)
  loading.value = true
  let newerItemsQuery = props.query || {}
  newerItemsQuery = {
    ...newerItemsQuery,
    depth: 2,
    sort: '-createdAt',
    where: {
      ...newerItemsQuery?.where,
    }
  }
  if(date){
    newerItemsQuery.where.createdAt = { greater_than: date };
    newerItemsQuery.createdGreaterThan = date; // Para el feed de El Salon que tiene un query diferente
  }

  const queryParams = qs.stringify(newerItemsQuery, { encode: false })
  const res = await useAPI(`${props.apiUrl}?${queryParams}`)
  console.log('Fetched newer items:', res)
  entradasPaginadas.value = [...res.docs, ...entradasPaginadas.value]
  loading.value = false
}

const handlePublicacionCreada = async (data) => {
  if (data.resultado == "ok") {
    // Publicacion exitosa. Cargo entradas nuevas
    await FetchNewerFromDate(entradasPaginadas.value[0]?.createdAt || null)
    // Resalto la entrada nueva
    entradaRefs.value[data.entrada.id].ResaltarEntrada();
  } else {
    console.error('Error al publicar la entrada:', data)
  }
}

const EliminarEntrada = async (id) => {
  try {
    // Puede estar en fijadas o en paginadas. Lo saco de ambos
    entradasFijadas.value = entradasFijadas.value.filter(entrada => entrada.id !== id)
    entradasPaginadas.value = entradasPaginadas.value.filter(entrada => entrada.id !== id)
  } catch (e) {
    console.warn(e);
  }
}

// Set up Intersection Observer
let observer
onMounted(() => {
  // Create observer
  observer = new IntersectionObserver(handleIntersect, {
    rootMargin: '100px', // Start loading before reaching the bottom
    threshold: 0.1
  })

  if (observerTarget.value) {
    observer.observe(observerTarget.value)
  }
  console.log("lista de entradas", listaEntradas.value)
  FetchBatchAprecios(listaEntradas.value);

  OnCreateEntryHook = hooks.hook('publicacion:creada', handlePublicacionCreada)
})

// Clean up
onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
  if (OnCreateEntryHook) OnCreateEntryHook()
})

</script>
