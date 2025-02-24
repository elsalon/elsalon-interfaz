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

        <div class="text-center flex flex-wrap justify-around items-center w-full mb-10 bg-neutral-100 dark:bg-neutral-900 p-1">
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
const salon = ref(null)
salon.value = salonStore.salones.find(salon => salon.slug === slug)
salonStore.setContext('salon', salon.value.id)
salonStore.SetPageTitle(salon.value.nombre)
const cacheKey = ref(`entradas-${salon.value.id}`)

var query = {
    where: {
        and: [
            { sala: { equals: salon.value.id } },
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
