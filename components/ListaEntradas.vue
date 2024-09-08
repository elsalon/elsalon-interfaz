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
        page.value++; // Increment page value before the request
        const res = await useApi(`api/entradas?page=${page.value}`)
        console.log(res)
        hasNextPage.value = res.hasNextPage
        page.value = res.page
        entradas.value = [...entradas.value, ...res.docs]
    }
</script>