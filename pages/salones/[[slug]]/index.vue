<template>
    <NuxtLayout name="layout-contenido">
        <div class="text-center mb-2">
            <Avatar :label="salon?.siglas" class="select-none cursor-pointer" :style="{backgroundColor: salon.color, color: '#fff'}" size="large" shape=""/>
            <h1 class="text-3xl font-bold">{{ salon.nombre }}</h1>
            <div v-if="miembros" class="text-md text-muted-color">
                <div>{{ miembros.totalDocs }} miembros</div>
                <!-- Lista de avatares de miembros -->
                <div class="flex justify-center space-x-2">
                    <NuxtLink v-for="miembro in miembros.docs" :key="miembro.id" :to="`/usuarios/${miembro.autor.slug}`" :title="miembro.autor.nombre">
                        <AvatarSalon :usuario="miembro.autor" size="small" imagesize="small"/>
                    </NuxtLink>
                    <!-- <AvatarSalon v-for="miembro in miembros.docs" :key="miembro.id" :usuario="miembro.autor" size="small" imagesize="small"/> -->
                </div>
                
            </div>
            <div v-else class="text-md text-muted-color">
                Cargando miembros...
            </div>
        </div>

        <BtnColaborar @estadoColaboracion="onEstadoColaboracion"/>
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

const query = slug ? `where[sala.slug][equals]=${slug}` : ''

const miembros = ref(null)

const onEstadoColaboracion = (estado) => {
    estadoColaboracion.value = estado;
    BuscarMiembros();
}

const BuscarMiembros = async () => {
    miembros.value = await useApi(`/api/colaboraciones?where[idColaborador][equals]=${salon.value.id}`);
    console.log(miembros.value)
}

// BuscarMiembros()
</script>
  
