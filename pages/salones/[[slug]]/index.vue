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
const salonStore = useSalonStore();
const salonId = salonStore.salones.find(salon => salon.slug === slug).id
salonStore.setContext('salon', salonId)

const query = slug ? `where[sala.slug][equals]=${slug}` : ''

const onEstadoColaboracion = (estado) => {
    estadoColaboracion.value = estado
}
</script>
  
