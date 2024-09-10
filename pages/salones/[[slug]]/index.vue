<template>
    <NuxtLayout name="layout-contenido">        
        <EditorEntrada />
        <!-- TODO Query -->
        <ListaEntradas :endpointQuery="query"/> 
    </NuxtLayout>
</template>

<script setup>
const route = useRoute()
const slug = route.params?.slug
const query = slug ? `where[sala.slug][equals]=${slug}` : ''
</script>
  
