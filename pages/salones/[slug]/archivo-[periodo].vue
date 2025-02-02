<template>
    <NuxtLayout name="layout-contenido">
        <template #header>
            <NuxtLink :to="`/salones/${salon.slug}`" class="link">{{ salon.nombre }}</NuxtLink> /
            Archivo {{ periodo.nombre }}
        </template>

        <div class="text-center mb-2">
            <LogoSala :salon="salon"/>
            <NuxtLink class="text-3xl font-bold" :to="`/salones/${salon.slug}`"><h1>{{ salon.nombre }}</h1></NuxtLink>
            
            <BtnListaComisiones :salon="salon" :periodo="periodo"/>
            <BtnListaArchivo v-if="salon.archivo.activar" :salon="salon"/>

        </div>
        <ListaEntradas :query="query" :cacheKey="cacheKey" :saltearFijadas="true"/> 
    </NuxtLayout>
</template>

<script setup>
// const estadoColaboracion = ref(false)
const route = useRoute()
const slug = route.params?.slug
const salonStore = useSalonStore();
const salon = ref(null)
salon.value = salonStore.salones.find(salon => salon.slug === slug)
const periodo = salon.value.archivo.periodos.find(periodo => periodo.slug === route.params.periodo)
salonStore.setContext('salon', salon.value.id)
salonStore.SetPageTitle(`Archivo ${salon.value.nombre} ${periodo.nombre}`)

const cacheKey = `archivo-${salon.value.id}-${periodo.slug}`

const startDate = encodeURIComponent(periodo.startDate.toISOString());
const endDate   = encodeURIComponent(periodo.endDate.toISOString());

const query = {
    where: {
        and: [
            { sala: { equals: salon.value.id } },
            { createdAt: { greater_than_equal: startDate } },
            { createdAt: { less_than_equal: endDate } },
        ]
    }
}

// console.log({startDate, endDate})
// console.log("***", query)

</script>