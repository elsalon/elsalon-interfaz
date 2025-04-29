<template>
    <NuxtLayout name="layout-contenido">
        <template #header>
            <RouterLink :to="`/`" class="link">S</RouterLink> /
            <template v-if="contexto">
                <NuxtLink :to="contextoUrl" class="link">{{ contexto.nombre }}</NuxtLink> /
            </template>
        </template>     
        <Entrada :key="entrada.id" :entrada="entrada" />
        <div class="h-10"></div>
    </NuxtLayout>
</template>

<script setup>
const elsalon = useSalonStore();
elsalon.setContext('entrada')
const route = useRoute()

// Extract the entradaId from slug
const slugParts = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug]
const entradaId = slugParts[0]
const isPlaylist = slugParts.length > 1 && slugParts[1] === 'playlist'

// We don't need to modify URL here since the Entrada component 
// will handle showing the playlist if the URL contains 'playlist'

const cacheKey = `entrada-${entradaId}`
const { data: entrada } = await useAsyncData(cacheKey, () => useAPI(`/api/entradas/${entradaId}`))

const contexto = ref(null)
const contextoUrl = ref(null)
if(!entrada.value.sala){
    // Bitacora
    if(entrada.value.autoriaGrupal){
        contexto.value = entrada.value.grupo;
        contextoUrl.value = `/grupos/${contexto.value.slug}`
    }else{
        contexto.value = entrada.value.autor;
        contextoUrl.value = `/usuarios/${contexto.value.slug}`
    }
}else{
    contexto.value = entrada.value.sala;
    contextoUrl.value = `/salas/${contexto.value.slug}`
}
if(contexto.value?.slug == "el-salon"){
    contexto.value = null
}
</script>