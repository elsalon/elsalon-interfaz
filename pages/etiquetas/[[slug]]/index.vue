<template>
    <NuxtLayout name="layout-contenido">
        <template #header>#{{ etiqueta?.nombre }}</template>  
        <ListaEntradas :query="query"/> 
    </NuxtLayout>
</template>

<script setup>
const route = useRoute()
const slug = route.params?.slug
const salonStore = useSalonStore();
const etiqueta = ref(null)
etiqueta.value = salonStore.etiquetas.find(etiqueta => etiqueta.slug === slug)
const query = {
    where: {
        and: [
            { etiquetas: { contains: etiqueta.value.id } },
        ]
    }
}

// TODO tambien buscar comentarios que tengan la etiqueta y agregarlos al feed ?
</script>
  
