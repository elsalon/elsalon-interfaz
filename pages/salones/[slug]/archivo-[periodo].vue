<template>
    <NuxtLayout name="layout-contenido">
        <div class="text-center mb-2">
            <LogoSala :salon="salon"/>
            <NuxtLink class="text-3xl font-bold" :to="`/salones/${salon.slug}`"><h1>{{ salon.nombre }}</h1></NuxtLink>
            <h2 class="text-xl font-bold">Archivo {{ periodo.nombre }}</h2>
            <BtnListaArchivo v-if="salon.archivo.activar" :salon="salon" />


            <!-- {{ periodo.startDate.toISOString() }} -->
            <!-- {{ periodo.startDate }} - {{ periodo.endDate }} -->
        </div>
        <ListaEntradas :endpointQuery="query"/> 
    </NuxtLayout>
</template>

<script setup>
// const estadoColaboracion = ref(false)
const route = useRoute()
const slug = route.params?.slug
const salonStore = useSalonStore();
const salon = ref(null)
salon.value = salonStore.salones.find(salon => salon.slug === slug)
salonStore.setContext('salon', salon.value.id)
const periodo = salon.value.archivo.periodos.find(periodo => periodo.slug === route.params.periodo)

const startDate = encodeURIComponent(periodo.startDate.toISOString());
const endDate   = encodeURIComponent(periodo.endDate.toISOString());
const dateRangeQuery = `&where%5Band%5D%5B0%5D%5BcreatedAt%5D%5Bgreater_than_equal%5D=${startDate}&where%5Band%5D%5B1%5D%5BcreatedAt%5D%5Bless_than_equal%5D=${endDate}`

const query = `where[sala][equals]=${salon.value.id}${dateRangeQuery}`

</script>