<template>
  <NotificacionEntradasNuevas ref="notifEntradasNuevas" />
  <!-- Loading State -->
  <div v-if="loading" class="my-4 text-center text-gray-500 text-sm">
    Cargando...
  </div>

  <!-- Empty State -->
  <div v-else-if="listaEntradas.length === 0" class="text-center text-gray-500 text-sm">
    No hay entradas
  </div>

  <!-- Content -->
  <div v-else class="space-y-10">
    <Entrada v-for="entrada in listaEntradas" :key="entrada.id" :entrada="entrada"
      @eliminar="EliminarEntrada(entrada.id)" />

    <!-- Pagination Status -->
    <div v-if="!hasNextPage" class="h-10 text-center text-gray-500 text-sm">No hay más entradas</div>
  </div>
</template>

<script setup>
const { hooks } = useNuxtApp();
const entradas = ref([]);
const loading = ref(true);
const entradasFijadas = ref([]);
const idsEntradasFijadas = ref([]);
const hasNextPage = ref(true);
const page = ref(1);
const scrollEndOffset = 300;
let coolingDown = false;
let checkNewEntriesInterval;
let removeOnCreateHook = null;
let removeOnFijar = null;
const SalonStore = useSalonStore();
const notifEntradasNuevas = ref(null);

// props
const props = defineProps({
  endpointQuery: { type: String, default: '' },
  overrideApiBase: { type: String, default: null },
  overrideApiBaseQuery: { type: Array, default: [] },
})

onMounted(async () => {
  loading.value = true
  await FetchFijadas();
  await CheckLlegoFinDePagina();
  window.addEventListener('scroll', CheckLlegoFinDePagina)

  // Set up interval to check for new entries every 2 minutes: 120000
  checkNewEntriesInterval = setInterval(FetchNewer, 120000)
  removeOnCreateHook = hooks.hook('publicacion:creada', VolverAFetchear)
  removeOnFijar = hooks.hook('publicacion:fijada', VolverAFetchear)
})

onUnmounted(() => {
  window.removeEventListener('scroll', CheckLlegoFinDePagina)
  clearInterval(checkNewEntriesInterval)
  if (removeOnCreateHook) removeOnCreateHook();
  if (removeOnFijar) removeOnFijar();
})

const handlePublicacionCreada = (data) => {
  if (data.resultado == "ok") {
    FetchNewer()
  }
}
const VolverAFetchear = async () => {
  entradas.value = []
  page.value = 1
  await FetchFijadas();
  await FetchEntries();
}

const EliminarEntrada = (id) => {
  entradas.value = entradas.value.filter(entrada => entrada.id != id)
}

const CheckLlegoFinDePagina = async () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - scrollEndOffset) {
    if (hasNextPage.value) {
      await FetchEntries()
      loading.value = false
      console.log('finished fetch entries')
    }
  }
}

const FetchFijadas = async () => {
  try {
    var res = await useAPI(`/api/fijadas?depth=4&where[contexto][equals]=${SalonStore.contextoId}&sort=-createdAt&limit=10`)
    idsEntradasFijadas.value = [] // = res.docs.map(fijada => fijada.entrada.id)

    res.docs.forEach(item => {
      if (item.entrada.id != undefined){
        idsEntradasFijadas.value.push(item.entrada.id)
        item.entrada.fijada = item.id; // le agrego el id de la fijada a la entrada
      }
    })
    res.docs = res.docs.filter(item => item.entrada.id != undefined)
    entradasFijadas.value = res.docs.map(item => item.entrada)
  } catch (e) {
    console.error(e)
  }
}

const FetchEntries = async () => {
  if (coolingDown) return
  coolingDown = true
  setTimeout(() => coolingDown = false, 1000)

  let apiUrl = `/api/entradas?depth=2&page=${page.value}&sort=-createdAt`
  if (props.overrideApiBase) {
    apiUrl = `${props.overrideApiBase}?page=${page.value}`
    apiUrl += `&${props.overrideApiBaseQuery.join('&')}`
  }
  if (props.endpointQuery != '') {
    apiUrl += `&${props.endpointQuery}`
  }

  // Como filtrar entre dos fechas
  // const startDate = encodeURIComponent(new Date('2024-10-10T00:00:00.000Z').toISOString());
  // const endDate   = encodeURIComponent(new Date('2024-10-14T23:59:59.999Z').toISOString());
  // const dateRangeQuery = `&where%5Band%5D%5B0%5D%5BcreatedAt%5D%5Bgreater_than_equal%5D=${startDate}&where%5Band%5D%5B1%5D%5BcreatedAt%5D%5Bless_than_equal%5D=${endDate}`
  // apiUrl += dateRangeQuery

  const res = await useAPI(apiUrl)
  hasNextPage.value = res.hasNextPage
  const nuevasEntradas = res.docs.filter(entrada => !idsEntradasFijadas.value.includes(entrada.id)) // Filtro las entradas que ya están fijadas
  entradas.value = [...entradas.value, ...nuevasEntradas];
  page.value++
}

const FetchNewer = async () => {
  const newestEntryDate = entradas.value[0]?.createdAt || new Date().toISOString()
  let apiUrl = `/api/entradas?depth=2&where[createdAt][greater_than]=${newestEntryDate}&sort=-createdAt&limit=100`
  if (props.overrideApiBase) {
    apiUrl = `${props.overrideApiBase}?createdGreaterThan=${newestEntryDate}`
    apiUrl += `&${props.overrideApiBaseQuery.join('&')}`
  }
  if (props.endpointQuery != '') {
    apiUrl += `&${props.endpointQuery}`
  }
  const res = await useAPI(apiUrl)
  if (res.docs.length > 0) {
    const nuevasEntradas = res.docs.filter(entrada => !idsEntradasFijadas.value.includes(entrada.id)) // Filtro las entradas que ya están fijadas
    nuevasEntradas.forEach(e => e.nueva = true)
    // console.log("nuevasEntradas", nuevasEntradas)
    entradas.value = [...nuevasEntradas, ...entradas.value];
    notifEntradasNuevas.value.Mostrar();
  }
}

const listaEntradas = computed(() => {
  return [...entradasFijadas.value, ...entradas.value]
})

</script>