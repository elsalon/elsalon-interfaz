<template>
    <div class="space-y-10">
        <Entrada v-for="entrada in entradas" :key="entrada.id" :entrada="entrada" />
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

    // props
    const props = defineProps({
        endpointQuery: { type: String, default: '' }
    })
    
    onMounted(() => {
        CheckLlegoFinDePagina()
        window.addEventListener('scroll', CheckLlegoFinDePagina)
        
        // Set up interval to check for new entries every 2 minutes
        checkNewEntriesInterval = setInterval(FetchNewer, 120000)


        removeOnCreateHook = hooks.hook('publicacion:creada', handlePublicacionCreada)
    })

    onUnmounted(() => {
        window.removeEventListener('scroll', CheckLlegoFinDePagina)
        clearInterval(checkNewEntriesInterval)
        if(removeOnCreateHook) removeOnCreateHook()
    })

    const handlePublicacionCreada = (data) => {
        if(data.resultado == "ok"){
            FetchNewer()
        }
    }
    
    const CheckLlegoFinDePagina = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - scrollEndOffset) {
        if (hasNextPage.value) {
          FetchEntries()
        }
      }
    }

    const FetchEntries = async () => {
      if (coolingDown) return
      coolingDown = true
      setTimeout(() => coolingDown = false, 1000)

      let apiUrl = `/api/entradas?depth=2&page=${page.value}&limit=${props.limit}`
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
      let apiUrl = `/api/entradas?depth=2&where[createdAt][greater_than]=${newestEntryDate}&sort=-createdAt&limit=100`
      if (props.endpointQuery != '') {
        apiUrl += `&${props.endpointQuery}`
      }
      const res = await useApi(apiUrl)
      if (res.docs.length > 0) {
        entradas.value = [...res.docs, ...entradas.value]
      }
    }
</script>