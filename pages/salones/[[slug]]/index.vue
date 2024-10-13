<template>
    <NuxtLayout name="layout-contenido">    
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
const SalonStore = useSalonStore();
const salonId = SalonStore.salones.find(salon => salon.slug === slug).id
SalonStore.setContext('salon', salonId)

const query = slug ? `where[sala.slug][equals]=${slug}` : ''

const onEstadoColaboracion = (estado) => {
    console.log('Estado colaboracion', estado)
    estadoColaboracion.value = estado
}
</script>
  
