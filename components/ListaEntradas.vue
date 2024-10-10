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
    const hasNextPage = ref(true);
    const page = ref(1);
    const scrollEndOffset = 300;
    let coolingDown = false;
    let checkNewEntriesInterval;
    let removeOnCreateHook = null;
    let removeOnFijar = null;

    // props
    const props = defineProps({
        endpointQuery: { type: String, default: '' }
    })
    
    onMounted(() => {
      FetchFijadas();
      CheckLlegoFinDePagina();
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
        FetchFijadas();
        FetchEntries();
    }

    const EliminarEntrada = (id) => {
      entradas.value = entradas.value.filter(entrada => entrada.id != id)  
    }
    
    const CheckLlegoFinDePagina = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - scrollEndOffset) {
        if (hasNextPage.value) {
          FetchEntries()
        }
      }
    }

    const FetchFijadas = async() => {
        let apiUrl = `/api/entradas?depth=2&where[fijada][equals]=true&sort=-createdAt`
        const res = await useApi(apiUrl)
        entradas.value = [...res.docs, ...entradas.value];
    }

    const FetchEntries = async () => {
      if (coolingDown) return
      coolingDown = true
      setTimeout(() => coolingDown = false, 1000)

      let apiUrl = `/api/entradas?depth=2&page=${page.value}&sort=-createdAt&where[fijada][not_equals]=true`
      if (props.endpointQuery != '') {
        apiUrl += `&${props.endpointQuery}`
      }
      const res = await useApi(apiUrl)
      hasNextPage.value = res.hasNextPage
      entradas.value = [...entradas.value, ...res.docs]
      page.value++
    }

    const FetchNewer = async () => {
      const newestEntryDate = entradas.value[0]?.createdAt || new Date().toISOString()
      let apiUrl = `/api/entradas?depth=2&where[createdAt][greater_than]=${newestEntryDate}&where[fijada][not_equals]=true&sort=-createdAt&limit=100`
      if (props.endpointQuery != '') {
        apiUrl += `&${props.endpointQuery}`
      }
      const res = await useApi(apiUrl)
      if (res.docs.length > 0) {
        entradas.value = [...res.docs, ...entradas.value]
      }
    }
</script>