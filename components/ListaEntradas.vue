<template>
  <NotificacionEntradasNuevas ref="notifEntradasNuevas" />

  <!-- Empty State -->
  <div v-if="listaEntradas.length === 0" class="text-center h-40 mt-10 flex flex-col justify-center items-center">
    <!-- CTA Primera publicacion -->
    <p class="font-bold">Todavía no hay entradas</p>
    <p class="text-zinc-600">Podés enlazarte y escribir la primera</p>
  </div>

  <!-- Content -->
  <div v-else :class="entradaContainerClass">
    <Entrada v-for="entrada in listaEntradas" :key="entrada.id + entrada.updatedAt" :entrada="entrada"
      @eliminar="EliminarEntrada(entrada.id)" :ref="(el) => setEntradaRef(el, entrada.id)" :theme="entradaTheme" />
  </div>
  <div class="h-10"></div>
  <div>
    <!-- Loading Indicator -->
    <Transition enter-from-class="translate-y-full opacity-0" enter-to-class="translate-y-0 opacity-100"
      leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-full opacity-0"
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-300 ease-in">
      <div v-if="loading"
        class="fixed left-1/2 transform -translate-x-1/2 text-sm flex items-center bg-zinc-100/80 p-1 transition-all duration-300 ease-in-out animate-slide-in-bottom"
        :class="{ 'bottom-4': loading, '-bottom-full': !loading }">
        <span class="texto-cargando">
          Cargando...
        </span>
      </div>
    </Transition>
    <!-- Pagination Status -->
    <div v-show="!hasNextPage && listaEntradas.length !== 0" class="mt-10 h-10 text-center text-zinc-400 text-sm">
      No hay más entradas
    </div>
  </div>

  <!-- Intersection observer target -->
  <div ref="observerTarget" class="h-4"></div>

</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useAsyncData } from "#app";
import qs from 'qs';
const notifEntradasNuevas = ref(null);
const SalonStore = useSalonStore();
const hasNextPage = ref(false);

// Props
const props = defineProps({
  entradaTheme: { type: String, default: 'default' },
  grid: { type: [Boolean, Number], default: false },
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

const entradaContainerClass = computed(() => {
  return {
    'space-y-10 md:space-y-0 md:grid grid-cols-3 gap-[8rem]': props.grid === true || props.grid === 3,
    'space-y-10 md:space-y-0 md:grid grid-cols-2 gap-x-4 gap-y-10': props.grid === 2,
    'space-y-10 md:space-y-0 md:grid grid-cols-4 gap-x-4 gap-y-10': props.grid === 4,
    'space-y-10 md:space-y-0 md:grid grid-cols-5 gap-x-4 gap-y-10': props.grid === 5,
    'space-y-10 md:space-y-0 md:grid grid-cols-6 gap-x-4 gap-y-10': props.grid === 6,
    'space-y-24 entrada-default-container': props.grid === false,
  }
})

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
let OnPublicacionEditadaHook = null; // Add this new hook

// Fetch inicial de entradas
const queryParams = qs.stringify({
  populate: 'entradas,comentarios', // custom query param
  depth: 2,
  sort: '-lastActivity',
  ...props.query,
}, { encode: false })
const { data: entradas } = await useAsyncData(props.cacheKey, () => useAPI(`${props.apiUrl}?${queryParams}`))
entradasPaginadas.value = entradas.value.docs;
hasNextPage.value = entradas.value.hasNextPage;

// Fetch inicial de fijadas

if (!props.saltearFijadas) {
  const cacheKey = `${props.cacheKey}:fijadas`;
  const queryParams = qs.stringify({
    populate: 'entradas,comentarios', // custom query param
    depth: 4,
    sort: '-lastActivity',
    limit: 12,
    where: {
      "contexto": { equals: SalonStore.contextoId }
    }
  }, { encode: false })
  const { data: entradasFijadasRes } = await useAsyncData(cacheKey, () => useAPI(`/api/fijadas?${queryParams}`))
  idsEntradasFijadas.value = [];
  entradasFijadasRes.value.docs.forEach(item => {
    if (item.entrada.id != undefined) {
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

const fetchNextItems = async () => {
  loading.value = true

  const lastItem = entradasPaginadas.value[entradasPaginadas.value.length - 1]
  const lastLastActivity = lastItem ? lastItem.lastActivity : null

  const baseQuery = {
    depth: 2,
    sort: '-lastActivity',
    createdLessThan: lastLastActivity,
    ...props.query,
    populate: 'entradas,comentarios'
  }

  if (lastLastActivity) {
    const lastActivityCondition = { lastActivity: { less_than: lastLastActivity } }

    if (baseQuery.where) {
      // If where is an 'and' array, replace or add lastActivity condition
      if (Array.isArray(baseQuery.where.and)) {
        // Remove any existing lastActivity condition
        baseQuery.where.and = baseQuery.where.and.filter(
          cond => !cond.lastActivity
        )
        baseQuery.where.and.push(lastActivityCondition)
      } else {
        // If where exists but is not an 'and' array, wrap it and add our condition
        baseQuery.where = { and: [baseQuery.where, lastActivityCondition] }
      }
    } else {
      // No where clause, just add it
      baseQuery.where = lastActivityCondition
    }
  }

  const queryParams = qs.stringify(baseQuery, { encode: false })

  try {
    const res = await useAPI(`${props.apiUrl}?${queryParams}`)
    console.log('Fetched items:', res)
    hasNextPage.value = res.hasNextPage
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

  // Query original y le saco el lastActivityy)
  let queryWhere = props.query;

  // New condition
  const lastActivityCondition = { lastActivity: { greater_than: date } };

  if (listaEntradas.value.length > 0) {
    // Solo agregamos la fecha si ya hay entradas
    // Sino buscamos las query original 
    if (queryWhere.where?.and) {
      // delete old lastActivity condition
      queryWhere.where.and = queryWhere.where.and.filter(item => !item.lastActivity) || {};
      queryWhere.where.and.push(lastActivityCondition)
    } else if (queryWhere.where) {
      queryWhere.where = queryWhere.where.filter(item => !item.lastActivity) || {};
      queryWhere.where = lastActivityCondition;
    }
  }

  let newerItemsQuery = {
    populate: 'entradas,comentarios', // custom query param
    depth: 2,
    sort: '-lastActivity',
    createdGreaterThan: date, // Para feed de El Salon que no tiene query nativo de payloadcms 
    where: queryWhere.where
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
    await FetchNewerFromDate(entradasPaginadas.value[0]?.lastActivity || Date.now())
    // Resalto la entrada nueva
    entradaRefs.value[data.entrada.id].ResaltarEntrada();
  } else {
    console.error('Error al publicar la entrada:', data)
  }
}

const handlePublicacionEditada = async (data) => {
  if (data.resultado == "ok") {
    // Find and update the entry in both fijadas and normal entries
    const entradaId = data.entrada.id;
    
    // Update in fijadas array if it exists there
    const fijadaIndex = entradasFijadas.value.findIndex(entrada => entrada.id === entradaId);
    if (fijadaIndex !== -1) {
      // Preserve the fijada id before replacing
      const fijadaId = entradasFijadas.value[fijadaIndex].fijada;
      entradasFijadas.value[fijadaIndex] = { ...data.entrada, fijada: fijadaId };
    }
    
    // Update in normal entries array
    const normalIndex = entradasPaginadas.value.findIndex(entrada => entrada.id === entradaId);
    if (normalIndex !== -1) {
      entradasPaginadas.value[normalIndex] = data.entrada;
    }
    
    // Highlight the updated entry
    nextTick(() => {
      if (entradaRefs.value[entradaId]) {
        entradaRefs.value[entradaId].ResaltarEntrada();
      }
    });
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
  OnEntradaFijadaHook = hooks.hook('entrada:fijada', ({ entrada, fijada }) => {
    entrada.fijada = fijada.id
    idsEntradasFijadas.value.push(entrada.id)
    entradasFijadas.value.unshift(entrada)
    nextTick(() => {
      entradaRefs.value[entrada.id].ResaltarEntrada();
    })
  })
  OnEntradaDesfijadaHook = hooks.hook('entrada:desfijada', ({ entrada, fijada }) => {
    entrada.fijada = null
    idsEntradasFijadas.value = idsEntradasFijadas.value.filter(id => id !== entrada.id)
    entradasFijadas.value = entradasFijadas.value.filter(item => item.id !== entrada.id)
  })
  
  // Add the new hook for edited publications
  OnPublicacionEditadaHook = hooks.hook('publicacion:editada', handlePublicacionEditada)
})

// Clean up
onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
  if (OnCreateEntryHook) OnCreateEntryHook()
  if (OnEntradaFijadaHook) OnEntradaFijadaHook()
  if (OnEntradaDesfijadaHook) OnEntradaDesfijadaHook()
  if (OnPublicacionEditadaHook) OnPublicacionEditadaHook() // Clean up the new hook
})

</script>
