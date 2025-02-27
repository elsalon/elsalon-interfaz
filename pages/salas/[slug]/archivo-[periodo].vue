<template>
    <NuxtLayout name="layout-contenido">
        <template #header>
            <RouterLink :to="`/`" class="link">S</RouterLink> /
            <NuxtLink :to="`/salas/${salon.slug}`" class="link">{{ salon.siglas }}</NuxtLink> /
            Archivo {{ periodo.nombre }}
        </template>

        <div class="text-center mb-2">
            <LogoSala :salon="salon"/>
            <NuxtLink class="text-3xl font-bold" :to="`/salas/${salon.slug}`"><h1>{{ salon.nombre }}</h1></NuxtLink>
            
            <BtnListaComisiones :salon="salon" :periodo="periodo"/>
            <BtnListaArchivo v-if="salon.archivo.activar" :salon="salon"/>

        </div>
        <ListaEntradas :query="query" :cacheKey="cacheKey" :saltearFijadas="true"/> 
    </NuxtLayout>
</template>

<script setup>
// const estadoEnlace = ref(false)
const route = useRoute()
const slug = route.params?.slug
const salonStore = useSalonStore();
const salon = ref(null)
salon.value = salonStore.salas.find(salon => salon.slug === slug)
const periodo = salon.value.archivo.periodos.find(periodo => periodo.slug === route.params.periodo)
salonStore.setContext('salon', salon.value.id)
salonStore.SetPageTitle(`Archivo ${salon.value.nombre} ${periodo.nombre}`)

const cacheKey = `archivo-${salon.value.id}-${periodo.slug}`

const startDate = encodeURIComponent(periodo.startDate);
const endDate   = encodeURIComponent(periodo.endDate);

const query = {
    where: {
        and: [
            { sala: { equals: salon.value.id } },
            { createdAt: { greater_than_equal: startDate } },
            { createdAt: { less_than_equal: endDate } },
        ]
    }
}
</script>