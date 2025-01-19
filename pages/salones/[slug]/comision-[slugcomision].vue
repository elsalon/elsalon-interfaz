<template>
    <NuxtLayout name="layout-contenido">
        <template #header>
            <NuxtLink :to="`/salones/${salon.slug}`" class="link">{{ salon.nombre }}</NuxtLink> /
            <CajaNombreComision :comision="comision"/>
        </template>
        

        <div class="text-center mb-2">
            <LogoSala :salon="salon"/>
            <NuxtLink class="text-3xl font-bold" :to="`/salones/${salon.slug}`"><h1>{{ salon.nombre }}</h1></NuxtLink>
            <!-- <h2 class="text-xl font-bold"></h2> -->
                 
            <BtnListaComisiones :salon="salon" :periodo="periodo" />
            <BtnListaArchivo v-if="salon.archivo.activar" :salon="salon" />
        </div>
        
        <!-- Docentes A Cargo y Alumnos -->
        <div class="mb-10">
            <h3 class="text-l font-bold">Integrantes</h3>
            <div class="flex space-x-2">
                <NuxtLink v-for="docente in comision.docentes" :key="docente.id" :to="`/usuarios/${docente.slug}`" :title="docente.nombre">
                    <AvatarSalon :usuario="docente" size="large"/>
                </NuxtLink>
                <NuxtLink v-for="integrante in comision.integrantes" :key="integrante.id" :to="`/usuarios/${integrante.slug}`" :title="integrante.nombre">
                    <AvatarSalon :usuario="integrante" size="large"/>
                </NuxtLink>

                <!-- {{ comision.grupos }} -->
                <NuxtLink v-for="grupo in comision.grupos" :key="grupo.id" :to="`/grupos/${grupo.slug}`" :title="grupo.nombre">
                    <AvatarSalon :usuario="grupo" size="large"/>
                </NuxtLink>
                <BtnUnirmeComision :comision="comision" @UsuarioCambioInscripcion="RecargarComision" :key="unirmeKey"/>
            </div>
        </div>

        <!-- <ListaEntradas :query="query"/> -->
        <ListaEntradas :apiUrl="`/api/comisiones/${comision.id}/feed`" :query="query" :key="unirmeKey" :cacheKey="cacheKey"/>
    </NuxtLayout>
</template>

<script setup>
const route = useRoute()
const slug = route.params?.slug
const salonStore = useSalonStore();
const salon = ref(null)
salon.value = salonStore.salones.find(salon => salon.slug === slug)
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
const cacheKey = `archivo-${salon.value.id}-${periodo.slug}`
if(salon.value.archivo.activar){
    const startDate = encodeURIComponent(periodo.startDate.toISOString());
    const endDate = encodeURIComponent(periodo.endDate.toISOString());
    query = {
        startDate,
        endDate,
    }
}
</script>