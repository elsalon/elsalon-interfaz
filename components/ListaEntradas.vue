<template>
    <div class="space-y-20">
        <Entrada v-for="entrada in entradas" :key="entrada.id" :entrada="entrada" />
    </div>
    
    <div v-if="!hasNextPage" class="my-4 text-center text-gray-500 text-sm">No hay más entradas</div>
    <div v-else class="my-4 text-center text-gray-500 text-sm">Cargando...</div>
</template>


<script setup>
    const entradas = ref([])
    const hasNextPage = ref(true);
    const page = ref(-1);
    const route = useRoute()

    
    onMounted(() => {
        FetchEntries();
        const scrollEndOffset = 300;

        window.onscroll = async () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight-scrollEndOffset) {
                if(hasNextPage.value){
                    FetchEntries();
                }
            }
        }
    })

    const FetchEntries = async () => {
        const slug = route.params?.slug || 'el-salon'; // TODO algo que no lo haga hardcodeado
        page.value++; // incremento la paginacion para hacerlo progreso en la siguiente llamada
        let apiUrl = `/api/entradas?depth=2&page=${page.value}`;
        if(slug){
            apiUrl += `&where[sala.slug][equals]=${slug}`;
        }else{
            // Dashboard el salon (TODO)
        }
        console.log("Fetching entries. Slug:", slug);
        const res = await useApi(apiUrl)
        // console.log(res)
        hasNextPage.value = res.hasNextPage
        page.value = res.page
        entradas.value = [...entradas.value, ...res.docs]
    }
</script>