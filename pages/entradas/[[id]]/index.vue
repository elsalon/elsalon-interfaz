<template>
    <NuxtLayout name="layout-contenido">
        <template #header>
            <RouterLink :to="`/`" class="link">S</RouterLink> /
            <template v-if="contexto">
                <NuxtLink :to="contextoUrl" class="link">{{ contexto.nombre }}</NuxtLink> /
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
    contextoUrl.value = `/salones/${contexto.value.slug}`
}
if(contexto.value?.slug == "el-salon"){
    contexto.value = null
}
</script>