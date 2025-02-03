<template>
    <NuxtLayout name="layout-contenido">
        <template #header>{{ salon.nombre }}</template>
        <div class="text-center mb-2">
            <LogoSala :salon="salon" />
            <h2 class="text-xl">
                <CajaAulas :salon="salon" />
            </h2>
        </div>

        <div class="text-center flex flex-wrap justify-around items-center w-full mb-10">
            <!-- Lista de avatares de miembros -->
            <ListaMiembrosSala :miembros="miembros" />

            <div class="flex-1 mb-4 md:w-1/2">
                <BtnListaComisiones :salon="salon" :periodo="periodo" />
            </div>

            <!-- Boton Archivo -->
            <div class="flex-1 mb-4 md:w-1/2">
                <BtnListaArchivo v-if="salon.archivo.activar" :salon="salon" />
            </div>

            <div class="flex-1 mb-4 md:w-1/2">
                <BtnColaborar @estadoColaboracion="onEstadoColaboracion" />
            </div>
        </div>


        <CrearEntradaBtn v-if="estadoColaboracion == 2" />
        <!-- TODO Query -->
        <ListaEntradas :query="query" :cacheKey="cacheKey" />
    </NuxtLayout>
</template>

<script setup>

const estadoColaboracion = ref(false)
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
    const startDate = encodeURIComponent(periodo.startDate.toISOString());
    const endDate = encodeURIComponent(periodo.endDate.toISOString());
    query.where.and.push({ createdAt: { greater_than_equal: startDate } })
    query.where.and.push({ createdAt: { less_than_equal: endDate } })
}

const primerEstadoColaboracionUpdate = ref(true)
const onEstadoColaboracion = (estado) => {
    estadoColaboracion.value = estado;
    if(!primerEstadoColaboracionUpdate.value){
        RefreshMiembros();
    }
    primerEstadoColaboracionUpdate.value = false;
}

const RefreshMiembros = async () => {
    miembros.value = await useAPI(`/api/colaboraciones?where[idColaborador][equals]=${salon.value.id}&limit=0`);
}

const miembrosCacheKey = `miembros-${salon.value.id}`;
const { data: miembros } = await useAsyncData(miembrosCacheKey, () => useAPI(`/api/colaboraciones?where[idColaborador][equals]=${salon.value.id}&limit=0`))

</script>
