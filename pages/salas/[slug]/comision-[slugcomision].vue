<template>
    <NuxtLayout name="layout-contenido">
        <template #header>
            <RouterLink :to="`/`" class="link">S</RouterLink> /
            <NuxtLink :to="`/salas/${salon.slug}`" class="link">{{ salon.siglas }}</NuxtLink> /
            <CajaNombreComision :comision="comision"/>
        </template>
        

        <div class="text-center mb-2">
            <LogoSala :salon="salon"/>
            <NuxtLink class="text-3xl font-bold" :to="`/salas/${salon.slug}`"><h1>{{ salon.nombre }}</h1></NuxtLink>
            <!-- <h2 class="text-xl font-bold"></h2> -->
                 
            <BtnListaComisiones :salon="salon" :periodo="periodo" />
            <BtnListaArchivo v-if="salon.archivo.activar" :salon="salon" />
        </div>
        
        <!-- Docentes A Cargo y Alumnos -->
        <div class="mb-10">
            <h3 class="text-l font-bold">Integrantes</h3>
            <div class="flex space-x-2">
                <NuxtLink v-for="docente in comision.docentes" :key="docente.id" :to="`/usuarios/${docente.slug}`" v-tooltip.top="docente.nombre">
                    <AvatarSalon :usuario="docente" size="large"/>
                </NuxtLink>
                <NuxtLink v-for="integrante in comision.integrantes" :key="integrante.id" :to="`/usuarios/${integrante.slug}`" v-tooltip.top="integrante.nombre">
                    <AvatarSalon :usuario="integrante" size="large"/>
                </NuxtLink>

                <!-- {{ comision.grupos }} -->
                <NuxtLink v-for="grupo in comision.grupos" :key="grupo.id" :to="`/grupos/${grupo.slug}`" v-tooltip.top="grupo.nombre">
                    <AvatarSalon :usuario="grupo" size="large"/>
                </NuxtLink>
                <BtnUnirmeComision :comision="comision" @UsuarioCambioInscripcion="RecargarComision" :key="unirmeKey"/>
            </div>
        </div>

        <ListaEntradas :apiUrl="`/api/comisiones/${comision.id}/feed`" :query="query" :key="unirmeKey" :cacheKey="cacheKey"/>
    </NuxtLayout>
</template>

<script setup>
const route = useRoute()
const slug = route.params?.slug
const salonStore = useSalonStore();
const salon = ref(null)
salon.value = salonStore.salas.find(salon => salon.slug === slug)
const slugComision = route.params?.slugcomision
const res = await useAPI(`/api/comisiones?where[or][0][and][0][slug][equals]=${slugComision}`);
const comision = ref(res.docs[0])
const unirmeKey = ref(0)
salonStore.setContext('salon', salon.value.id)
salonStore.SetPageTitle(`Comisión ${comision.value.nombre}`)
const RecargarComision = async () => {
    const res = await useAPI(`/api/comisiones?where[or][0][and][0][slug][equals]=${slugComision}`);
    comision.value = res.docs[0]
    unirmeKey.value++;
}


// Filtro por el periodo actual
let query = {}
const periodo = salon.value.archivo.periodos[0]
const cacheKey = `comision-${salon.value.id}-${periodo.slug}`
if(salon.value.archivo.activar){
    const startDate = encodeURIComponent(periodo.startDate);
    const endDate = encodeURIComponent(periodo.endDate);
    query = {
        startDate,
        endDate,
    }
}
</script>