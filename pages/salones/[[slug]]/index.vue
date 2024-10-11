<template>
    <NuxtLayout name="layout-contenido">    
        <BtnColaborar/>    
        <CrearEntradaBtn />
        <!-- TODO Query -->
        <ListaEntradas :endpointQuery="query"/> 
    </NuxtLayout>
</template>

<script setup>

const route = useRoute()
const slug = route.params?.slug
const SalonStore = useSalonStore();
const salonId = SalonStore.salones.find(salon => salon.slug === slug).id
SalonStore.setContext('salon', salonId)

const query = slug ? `where[sala.slug][equals]=${slug}` : ''
</script>
  
