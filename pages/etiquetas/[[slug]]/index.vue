<template>
    <NuxtLayout name="layout-contenido">
        <div class="text-center">
            <h1 class="text-3xl font-bold">#{{ etiqueta?.nombre }}</h1>
        </div>
        <ListaEntradas :endpointQuery="query"/> 
    </NuxtLayout>
</template>

<script setup>
const route = useRoute()
const slug = route.params?.slug
const salonStore = useSalonStore();
const etiqueta = ref(null)
etiqueta.value = salonStore.etiquetas.find(etiqueta => etiqueta.slug === slug)
const query = slug ? `where[etiquetas][contains]=${etiqueta.value.id}` : ''

// TODO tambien buscar comentarios que tengan la etiqueta y agregarlos al feed ?
</script>
  
