<template>
    <NuxtLayout name="layout-contenido">
        <template #header>
            <RouterLink :to="`/`" class="link">S</RouterLink> /
            <template v-if="contexto">
                <NuxtLink :to="contextoUrl" class="link">{{ contexto.nombre }}</NuxtLink> /
            </template>
        </template>     
        <CrearEntradaBtn :show-button="false" />
        <div v-if="!entrada" class="text-center h-40 mt-10 flex flex-col justify-center items-center text-zinc-500">
            Cargando...
        </div>
        <Entrada v-else :key="entrada.id" :entrada="entrada" />
        <div class="h-10"></div>
    </NuxtLayout>
</template>

<script setup>
const elsalon = useSalonStore();
elsalon.setContext('entrada')
const route = useRoute()
const { hooks } = useNuxtApp()

// Extract the entradaId from slug
const slugParts = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug]
const entradaId = slugParts[0]

// We don't need to modify URL here since the Entrada component 
// will handle showing the playlist if the URL contains 'playlist'

const cacheKey = `entrada-${entradaId}`
const { data: entrada, error } = useAsyncData(cacheKey, () => useAPI(`/api/entradas/${entradaId}`), { lazy: true, server: false })

watch(error, (e) => {
    if (e) {
        showError({
            statusCode: e.statusCode || 404,
            statusMessage: 'Not Found',
        })
    }
})

let removeOnEditFinishHook = null

const handlePublicacionEditada = (data) => {
    if (data?.resultado === 'ok' && data?.entrada?.id === entrada.value?.id) {
        entrada.value = data.entrada
    }
}

onMounted(() => {
    removeOnEditFinishHook = hooks.hook('publicacion:editada', handlePublicacionEditada)
})

onUnmounted(() => {
    if (removeOnEditFinishHook) removeOnEditFinishHook()
})

// Derivado reactivamente porque entrada llega de forma asíncrona (fetch no bloqueante)
const contexto = computed(() => {
    const e = entrada.value
    if (!e) return null
    const c = e.sala ? e.sala : (e.autoriaGrupal ? e.grupo : e.autor)
    if (c?.slug == "el-salon") return null
    return c
})

const contextoUrl = computed(() => {
    const e = entrada.value
    if (!e) return null
    if (e.sala) return `/salas/${e.sala.slug}`
    return e.autoriaGrupal ? `/grupos/${e.grupo.slug}` : `/usuarios/${e.autor.slug}`
})
</script>