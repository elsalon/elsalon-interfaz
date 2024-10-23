<template>
    <NuxtLayout name="layout-contenido">     
        <div class="text-center mb-2">
            <LogoSala :salon="salon"/>
            <h1 class="text-3xl font-bold">{{ salon.nombre }} </h1>
            <h2 class="text-xl"><CajaAulas :salon="salon"/></h2>
        </div>
        
        <div class="text-center flex flex-wrap justify-around items-center w-full mb-10">
            <!-- Lista de avatares de miembros -->
            <div class="flex-1 mb-4 md:w-1/2">
                <div v-if="miembros" class="text-md text-muted-color">
                    <div class="flex justify-center space-x-2">
                        <NuxtLink v-for="miembro in miembros.docs" :key="miembro.id" :to="`/usuarios/${miembro.autor.slug}`" :title="miembro.autor.nombre">
                            <AvatarSalon :usuario="miembro.autor" size="small" imagesize="small"/>
                        </NuxtLink>
                        <span v-if="miembros.totalDocs > miembros.docs.length" class="text-muted-color">+{{ miembros.totalDocs - miembros.docs.length }}</span>
                    </div>    
                </div>
                <div v-else class="text-md text-muted-color">...</div>
            </div>

            <div class="flex-1 mb-4 md:w-1/2">
                <BtnListaComisiones :salon="salon" />
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
        <ListaEntradas :endpointQuery="query"/> 
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

var dateRangeQuery = '';
// Si este espacio tiene archivo, filtro por el periodo actual
if(salon.value.archivo.activar){
    const periodo = salon.value.archivo.periodos[0]
    const startDate = encodeURIComponent(periodo.startDate.toISOString());
    const endDate   = encodeURIComponent(periodo.endDate.toISOString());
    dateRangeQuery = `&where%5Band%5D%5B0%5D%5BcreatedAt%5D%5Bgreater_than_equal%5D=${startDate}&where%5Band%5D%5B1%5D%5BcreatedAt%5D%5Bless_than_equal%5D=${endDate}`
}

const query = `where[sala][equals]=${salon.value.id}${dateRangeQuery}`

const miembros = ref(null)

const onEstadoColaboracion = (estado) => {
    estadoColaboracion.value = estado;
    BuscarMiembros();
}

const BuscarMiembros = async () => {
    miembros.value = await useApi(`/api/colaboraciones?where[idColaborador][equals]=${salon.value.id}`);
    // console.log(miembros.value)
}



</script>
  
