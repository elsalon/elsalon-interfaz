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
let OnEntradaFijadaHook = null;
let OnEntradaDesfijadaHook = null;

// Fetch inicial de entradas
const queryParams = qs.stringify({
  populate: 'entradas,comentarios', // custom query param
  depth: 2,
  sort: '-createdAt',
  ...props.query,
}, { encode: false })
const { data: entradas } = await useAsyncData(props.cacheKey, () => useAPI(`${props.apiUrl}?${queryParams}`))
entradasPaginadas.value = entradas.value.docs;
hasNextPage.value = entradas.value.hasNextPage;

// Fetch inicial de fijadas

if(!props.saltearFijadas){
  const cacheKey = `${props.cacheKey}:fijadas`;
  const queryParams = qs.stringify({
    populate: 'entradas,comentarios', // custom query param
    depth: 4,
    sort: '-createdAt',
    limit: 12,
    where: {
      "contexto": { equals: SalonStore.contextoId }
    }
  }, { encode: false })
  const { data: entradasFijadasRes } = await useAsyncData(cacheKey, () => useAPI(`/api/fijadas?${queryParams}` ))
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
const fetchNextItems = async () => {
  loading.value = true

  // Get the last item's createdAt timestamp
  const lastItem = entradasPaginadas.value[entradasPaginadas.value.length - 1];
  const lastCreatedAt = lastItem ? lastItem.createdAt : null;
  // Build the base query
  const baseQuery = {
    depth: 2,
    sort: '-createdAt',
    createdLessThan: lastCreatedAt,
    ...props.query,
  };

  // Add the createdAt condition if there's a last item
  if (lastCreatedAt) {
    const createdAtCondition = { createdAt: { less_than: lastCreatedAt } };

    if (baseQuery.where) {
      // If there's an existing `where` clause, merge it with the new condition
      if (baseQuery.where.and) {
        baseQuery.where.and.push(createdAtCondition);
      } else {
        baseQuery.where = { and: [baseQuery.where, createdAtCondition] };
      }
    } else {
      // If no `where` clause exists, create one
      baseQuery.where = createdAtCondition;
    }
  }
  baseQuery.populate = 'entradas,comentarios'; // custom query param

  const queryParams = qs.stringify(baseQuery, { encode: false });

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
    await fetchNextItems()
  }
}


const FetchNewerFromDate = async (date) => {
  console.log('Fetching newer items from:', date)
  loading.value = true

  // Query original y le saco el createdAt
  let queryWhere = props.query?.where?.and.filter(item => !item.createdAt) || {};
  const createdAtCondition = { createdAt: { greater_than: date } };
  
  if (queryWhere?.where) {
    // If there's an existing `where` clause, merge it with the new condition
    if (queryWhere.where.and) {
      queryWhere.where.and.push(createdAtCondition);
    }
  } else {
    // If no `where` clause exists, create one
    queryWhere.where = createdAtCondition;
  }
    
  let newerItemsQuery = {  
    populate: 'entradas,comentarios', // custom query param
    depth: 2,
    sort: '-createdAt',
    createdGreaterThan: date, // Para feed de El Salon que no tiene query nativo de payloadcms 
    where: queryWhere
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
    await FetchNewerFromDate(entradasPaginadas.value[0]?.createdAt || Date.now())
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
  // console.log("lista de entradas", listaEntradas.value)

  OnCreateEntryHook = hooks.hook('publicacion:creada', handlePublicacionCreada)
  OnEntradaFijadaHook = hooks.hook('entrada:fijada', ({entrada, fijada}) => {
    entrada.fijada = fijada.id
    idsEntradasFijadas.value.push(entrada.id)
    entradasFijadas.value.unshift(entrada)
    nextTick(() => {
      entradaRefs.value[entrada.id].ResaltarEntrada();
    })
  })
  OnEntradaDesfijadaHook = hooks.hook('entrada:desfijada', ({entrada, fijada}) => {
    entrada.fijada = null
    idsEntradasFijadas.value = idsEntradasFijadas.value.filter(id => id !== entrada.id)
    entradasFijadas.value = entradasFijadas.value.filter(item => item.id !== entrada.id)
  })
})

// Clean up
onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
  if (OnCreateEntryHook) OnCreateEntryHook()
  if(OnEntradaFijadaHook) OnEntradaFijadaHook()
})

</script>
