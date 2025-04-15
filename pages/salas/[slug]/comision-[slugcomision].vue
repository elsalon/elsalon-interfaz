<template>
    <NuxtLayout name="layout-contenido">
        <template #header>
            <RouterLink :to="`/`" class="link">S</RouterLink> /
            <NuxtLink :to="`/salas/${salon.slug}`" class="link">{{ salon.siglas }}</NuxtLink> /
            {{ comision.nombre }}
        </template>
        

        <div class="text-center mb-2">
            <LogoSala :salon="salon"/>
            <NuxtLink class="text-3xl font-bold" :to="`/salas/${salon.slug}`"><h1>{{ salon.nombre }}</h1></NuxtLink>
            
            <h2 class="text-xl font-bold">
                <CajaNombreComision :comision="comision"/>
            </h2>
            <!-- <h2 class="text-xl font-bold"></h2> -->
                 
            <BtnListaComisiones :salon="salon" :periodo="periodo" />
            <BtnListaArchivo v-if="salon.archivo.activar" :salon="salon" />
        </div>
        
        <!-- Docentes A Cargo y Alumnos -->
        <div class="text-center flex justify-evenly items-center gap-x-2 w-full mb-2 bg-white p-1">
            <div class="flex justify-center flex-wrap gap-x-1 items-center self-center">
                <!-- Docentes -->
                <NuxtLink v-for="docente in comision.docentes" class="h-6" :key="docente.id" :to="`/usuarios/${docente.slug}`" v-tooltip.top="docente.nombre">
                    <AvatarSalon :usuario="docente" size="small" imagesize="small" />
                </NuxtLink>
                <!-- Alumnxs -->
                <NuxtLink v-for="integrante in comision.integrantes" class="h-6" :key="integrante.id" :to="`/usuarios/${integrante.slug}`" v-tooltip.top="integrante.nombre">
                    <AvatarSalon :usuario="integrante" size="small" imagesize="small" />
                </NuxtLink>
                <!-- Grupos -->
                <NuxtLink v-for="grupo in comision.grupos" class="h-6" :key="grupo.id" :to="`/grupos/${grupo.slug}`" v-tooltip.top="grupo.nombre">
                    <AvatarSalon :usuario="grupo" size="small" imagesize="small" />
                </NuxtLink>
            </div>
            
            <!-- Btn Abandonar -->
            <BtnUnirmeComision :comision="comision" @UsuarioCambioInscripcion="RecargarComision" :key="unirmeKey"/>
            
            <!-- Btn tooltip info comision -->
             <div class="w-6 h-6" tabindex="1" v-tooltip.top.focus="'Las comisiones funcionan como un filtro, reuniendo en un solo lugar las entradas y bitácoras de sus integrantes y grupos, sin ser un espacio de publicación directa.'">
                <i class="pi pi-question-circle text-zinc-600 hover:text-zinc-900"></i>
             </div>
        </div>

        <div class="h-8"></div>

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
    query = {
        where: {
            and: [
                { createdAt: { greater_than_equal: periodo.startDate } },
                { createdAt: { less_than_equal: periodo.endDate } }
            ]
        }
    }
}
</script>