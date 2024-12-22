<template>
  <NotificacionEntradasNuevas ref="notifEntradasNuevas" />

  <!-- Empty State -->
  <div v-if="listaEntradas.length === 0" class="text-center text-gray-500 text-sm">
    No hay entradas
  </div>

  <!-- Content -->
  <div v-else class="space-y-10">
    <Entrada v-for="entrada in listaEntradas" :key="entrada.id" :entrada="entrada"
      @eliminar="eliminarEntrada(entrada.id)" />

    <!-- Loading Indicator -->
  <div
    v-if="loading"
    class="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-gray-500 text-sm flex items-center"
  >
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
const notifEntradasNuevas = ref(null);
const scrollEndOffset = 300;
const SalonStore = useSalonStore();
const hasNextPage = ref(false);

// Props
const props = defineProps({
  endpointQuery: { type: Object, default: {} },
  overrideApiBase: { type: String, default: null },
  overrideApiBaseQuery: { type: Array, default: [] },
  cacheKey: { type: String, default: null },
});

// States
const page = ref(1);
const idsEntradasFijadas = ref([]);
const entradasFijadas = ref([]);
const entradasPaginadas = ref([]);
const loading = ref(false);
const observerTarget = ref(null)

// Fetch inicial de entradas
var cacheKey = `${props.cacheKey}:page${page.value}`;
const { data: entradas } = await useAsyncData(cacheKey, () => useAPI('/api/entradas', {
  params: {
    depth: 2,
    page: page.value,
    sort: '-createdAt',
    ...props.endpointQuery
  },
}))
entradasPaginadas.value = entradas.value.docs;
hasNextPage.value = entradas.value.hasNextPage;

// Fetch inicial de fijadas
cacheKey = `${props.cacheKey}:fijadas`;
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

const listaEntradas = computed(() => {
  if (!entradasFijadas.value || !entradasPaginadas.value) return [];
  const filteredEntries = entradasPaginadas.value.filter(entry => !idsEntradasFijadas.value.includes(entry.id));
  return [...entradasFijadas.value, ...filteredEntries];
})


// Fetch paginated entries
const fetchItems = async (pageNum) => {
  loading.value = true
  console.log('Fetching items:', pageNum)
  try {
    // Replace with your API endpoint
    cacheKey = `${props.cacheKey}:page${pageNum}`;
    const res = await useAPI('/api/entradas', {
      params: {
        depth: 2,
        page: pageNum,
        sort: '-createdAt',
        ...props.endpointQuery
      }
    })
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
})

// Clean up
onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

</script>
