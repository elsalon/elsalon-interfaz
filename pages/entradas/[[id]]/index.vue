<template>
    <NuxtLayout name="layout-contenido">
        <template #header>
            <RouterLink :to="`/`" class="link">S</RouterLink> /
            <template v-if="contexto">
                <NuxtLink :to="`/salones/${contexto.slug}`" class="link">{{ contexto.nombre }}</NuxtLink> /
            </template>
        </template>     
        <Entrada :key="entrada.id" :entrada="entrada" />
    </NuxtLayout>
</template>


<script setup>
const elsalon = useSalonStore();
elsalon.setContext('entrada')
const route = useRoute()
const entradaId = route.params?.id
const cacheKey = `entrada-${entradaId}`
const { data: entrada } = await useAsyncData(cacheKey, () => useAPI((`/api/entradas/${entradaId}`)))

const contexto = ref(null)
if(!entrada.value.sala){
    // Bitacora
    contexto.value = entrada.value.autoriaGrupal ? entrada.value.grupo : entrada.value.autor
}else{
    contexto.value = entrada.value.sala;
}
if(contexto.value?.slug == "el-salon"){
    contexto.value = null
}
</script>