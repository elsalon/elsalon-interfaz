<template>
    <NuxtLayout name="layout-contenido">
        <template #header>
            <RouterLink :to="`/`" class="link">S</RouterLink> /
            {{ salon.nombre }}
        </template>
        <div class="text-center mb-2">
            <LogoSala :salon="salon" />
            <h2 class="text-xl">
                <CajaAulas :salon="salon" />
            </h2>
        </div>

        <!-- Menu principal Sala -->
        <div class="text-center flex flex-wrap justify-around items-center w-full mb-2 bg-white p-1">
            <!-- Lista de avatares de miembros -->
            <ListaMiembrosSala :miembros="miembros" />

            <div class="flex-1 md:w-1/2">
                <BtnListaComisiones :salon="salon" :periodo="periodo" />
            </div>

            <!-- Boton Archivo -->
            <div class="flex-1 md:w-1/2" v-if="salon.archivo.activar" >
                <BtnListaArchivo :salon="salon" />
            </div>

            <div class="flex-1 md:w-1/2">
                <BtnEnlazar @estadoEnlace="onEstadoEnlace" type="sala"/>
            </div>
        </div>
        
        <!-- Secciones -->
        <div class="text-center flex flex-wrap justify-center gap-x-2 items-center w-full mb-6 p-1 text-sm">
            <SeccionesSalaListaSecciones :salon="salon" />
            <SeccionesSalaBtnAgregarSeccion :salon="salon" />            
        </div>

        <!-- Linea de Tiempo -->
        <div>
            <LineaDeTiempo v-if="salon.eventos.activar && estadoEnlace == 2" :salon="salon"/>
        </div>
        <div>
            <ListaEntradas :query="query" :cacheKey="cacheKey" />
        </div>
        
        <CrearEntradaBtn v-if="estadoEnlace == 2" />
    </NuxtLayout>
</template>

<script setup>
const estadoEnlace = ref(false)
const route = useRoute()
const slug = route.params?.slug
const salonStore = useSalonStore();

const salon = computed(() => {
  const found = salonStore.salas.find(s => s.slug === slug)
  if (!found) console.warn(`Salon with slug "${slug}" not found`)
  return found
})

// Update these lines to handle possible undefined value during initial load
// and use optional chaining
salonStore.setContext('salon', salon.value?.id)
salonStore.SetPageTitle(salon.value?.nombre || '')
const cacheKey = ref(`entradas-${salon.value?.id || ''}`)

// Make sure to add null checks throughout your query
var query = {
    where: {
        and: [
            { sala: { equals: salon.value?.id } },
        ]
    }
}

// Si este espacio tiene archivo, filtro por el periodo actual
const periodo = salon.value.archivo.periodos[0]
if (salon.value.archivo.activar) {
    const startDate = encodeURIComponent(periodo.startDate);
    const endDate = encodeURIComponent(periodo.endDate);
    query.where.and.push({ createdAt: { greater_than_equal: startDate } })
    query.where.and.push({ createdAt: { less_than_equal: endDate } })
}

const primerestadoEnlaceUpdate = ref(true)
const onEstadoEnlace = (estado) => {
    estadoEnlace.value = estado;
    if(!primerestadoEnlaceUpdate.value){
        RefreshMiembros();
    }
    primerestadoEnlaceUpdate.value = false;
}

const RefreshMiembros = async () => {
    miembros.value = await useAPI(`/api/enlaces?where[idEnlazado][equals]=${salon.value.id}&limit=0`);
}

const miembrosCacheKey = `miembros-${salon.value.id}`;
const { data: miembros } = await useAsyncData(miembrosCacheKey, () => useAPI(`/api/enlaces?where[idEnlazado][equals]=${salon.value.id}&limit=0`))

</script>
