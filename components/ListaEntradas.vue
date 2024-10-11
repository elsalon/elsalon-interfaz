<template>
    <div class="space-y-10">
        <Entrada v-for="entrada in entradas" :key="entrada.id" :entrada="entrada" @eliminar="EliminarEntrada(entrada.id)" />
    </div>
    
    <div v-if="!hasNextPage" class="my-4 text-center text-gray-500 text-sm">No hay más entradas</div>
    <div v-else class="my-4 text-center text-gray-500 text-sm">Cargando...</div>
</template>


<script setup>
    const { hooks } = useNuxtApp();
    const entradas = ref([]);
    const idsEntradasFijadas = ref([]);
    const hasNextPage = ref(true);
    const page = ref(1);
    const scrollEndOffset = 300;
    let coolingDown = false;
    let checkNewEntriesInterval;
    let removeOnCreateHook = null;
    let removeOnFijar = null;
    const SalonStore = useSalonStore();

    // props
    const props = defineProps({
        endpointQuery: { type: String, default: '' }
    })
    
    onMounted(async () => {
      await FetchFijadas();
      await CheckLlegoFinDePagina();
      window.addEventListener('scroll', CheckLlegoFinDePagina)
      
      // Set up interval to check for new entries every 2 minutes
      checkNewEntriesInterval = setInterval(FetchNewer, 120000)
      removeOnCreateHook = hooks.hook('publicacion:creada', handlePublicacionCreada)
      removeOnFijar = hooks.hook('publicacion:fijada', VolverAFetchear)
    })

    onUnmounted(() => {
        window.removeEventListener('scroll', CheckLlegoFinDePagina)
        clearInterval(checkNewEntriesInterval)
        if(removeOnCreateHook) removeOnCreateHook();
        if(removeOnFijar) removeOnFijar();
    })

    const handlePublicacionCreada = (data) => {
        if(data.resultado == "ok"){
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
        }
      }
    }

    const FetchFijadas = async() => {
      let apiUrl = `/api/fijadas?depth=3&where[contexto][equals]=${SalonStore.contextoId}&sort=-createdAt&limit=10`
      const res = await useApi(apiUrl)
      idsEntradasFijadas.value = [] // = res.docs.map(fijada => fijada.entrada.id)

      res.docs.forEach(item => {
        idsEntradasFijadas.value.push(item.entrada.id)
        item.entrada.fijada = item.id; // le agrego el id de la fijada a la entrada
      }) 
      console.log("idsEntradasFijadas",idsEntradasFijadas.value)
      entradas.value = [...res.docs.map(item => item.entrada), ...entradas.value];
    }

    const FetchEntries = async () => {
      if (coolingDown) return
      coolingDown = true
      setTimeout(() => coolingDown = false, 1000)

      let apiUrl = `/api/entradas?depth=2&page=${page.value}&sort=-createdAt`
      if (props.endpointQuery != '') {
        apiUrl += `&${props.endpointQuery}`
      }
      const res = await useApi(apiUrl)
      hasNextPage.value = res.hasNextPage
      const entradasNoFijadas = res.docs.filter(entrada => !idsEntradasFijadas.value.includes(entrada.id))
      console.log("Entradas no fijadas")
      entradas.value = [...entradas.value, ...entradasNoFijadas]
      page.value++
    }

    const FetchNewer = async () => {
      const newestEntryDate = entradas.value[0]?.createdAt || new Date().toISOString()
      let apiUrl = `/api/entradas?depth=2&where[createdAt][greater_than]=${newestEntryDate}&sort=-createdAt&limit=100`
      if (props.endpointQuery != '') {
        apiUrl += `&${props.endpointQuery}`
      }
      const res = await useApi(apiUrl)
      if (res.docs.length > 0) {
        const entradasNoFijadas = res.docs.filter(entrada => !idsEntradasFijadas.value.includes(entrada.id))
        entradas.value = [entradasNoFijadas, ...entradas.value] // ? esto puede quedar raro? Porque quedarian las fijas por debajo de las nuevas
      }
    }
</script>