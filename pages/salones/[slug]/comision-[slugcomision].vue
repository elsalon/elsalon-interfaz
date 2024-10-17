<template>
    <NuxtLayout name="layout-contenido">
        <div class="text-center mb-2">
            <LogoSala :salon="salon"/>
            <NuxtLink class="text-3xl font-bold" :to="`/salones/${salon.slug}`"><h1>{{ salon.nombre }}</h1></NuxtLink>
            <h2 class="text-xl font-bold">Comisión <CajaNombreComision :comision="comision"/></h2>
                 
            <BtnListaComisiones :salon="salon" />
            <BtnListaArchivo v-if="salon.archivo.activar" :salon="salon" />
        </div>
        
        <!-- Docentes A Cargo y Alumnos -->
        <div class="mb-10">
            <h3 class="text-l font-bold">Integrantes</h3>
            <div class="flex space-x-2">
                <NuxtLink v-for="docente in comision.docentes" :key="docente.id" :to="`/usuarios/${docente.slug}`" :title="docente.nombre">
                    <AvatarSalon :usuario="docente" size="small"/>
                </NuxtLink>
                <NuxtLink v-for="integrante in comision.integrantes" :key="integrante.id" :to="`/usuarios/${integrante.slug}`" :title="integrante.nombre">
                    <AvatarSalon :usuario="integrante" size="small"/>
                </NuxtLink>

                <!-- {{ comision.grupos }} -->
                <NuxtLink v-for="grupo in comision.grupos" :key="grupo.id" :to="`/grupos/${grupo.slug}`" :title="grupo.nombre">
                    <AvatarSalon :usuario="grupo" size="small"/>
                </NuxtLink>
            </div>
            <BtnUnirmeComision :comision="comision" @UsuarioCambioInscripcion="RecargarComision" :key="unirmeKey"/>
        </div>

        <!-- <ListaEntradas :endpointQuery="query"/> -->
        <ListaEntradas :overrideApiBase="`/api/comisiones/${comision.id}/feed`" :overrideApiBaseQuery="overrideApiBaseQuery"/>
    </NuxtLayout>
</template>

<script setup>
const route = useRoute()
const slug = route.params?.slug
const salonStore = useSalonStore();
const salon = ref(null)
salon.value = salonStore.salones.find(salon => salon.slug === slug)
salonStore.setContext('salon', salon.value.id)
const slugComision = route.params?.slugcomision
const res = await useApi(`/api/comisiones?where[or][0][and][0][slug][equals]=${slugComision}`, null, 'GET');
const comision = ref(res.docs[0])
const unirmeKey = ref(0)
const RecargarComision = async () => {
    const res = await useApi(`/api/comisiones?where[or][0][and][0][slug][equals]=${slugComision}`, null, 'GET');
    comision.value = res.docs[0]
    unirmeKey.value++;
}

const idsIntegrantes = comision.value.integrantes?.map(integrante => integrante.id)
console.log(comision.value.integrantes)

// Filtro por el periodo actual
const periodo = salon.value.archivo.periodos[0]
const startDate = periodo.startDate.toISOString();
const endDate   = periodo.endDate.toISOString();
// const dateRangeQuery = `&where%5Band%5D%5B0%5D%5BcreatedAt%5D%5Bgreater_than_equal%5D=${startDate}&where%5Band%5D%5B1%5D%5BcreatedAt%5D%5Bless_than_equal%5D=${endDate}`

// De alumnos que son integrantes de la comisión y hayan creado entradas en esta sala
// const query = `where[sala][equals]=${salon.value.id}${dateRangeQuery}&where[autor][in]=${idsIntegrantes?.join(',')}`
// const overrideApiBase = `/api/comisiones/${comision.value.id}/feed?startDate=${startDate}&endDate=${endDate}`
const overrideApiBaseQuery= [`startDate=${startDate}`, `endDate=${endDate}`]
</script>