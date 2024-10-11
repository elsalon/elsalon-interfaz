<template>
    <NuxtLayout name="layout-contenido">        
        <Entrada :key="entrada.id" :entrada="entrada" />
    </NuxtLayout>
</template>


<script setup>
const elsalon = useSalonStore();
elsalon.setContext('entrada')
const route = useRoute()
const entradaId = route.params?.id
const entrada = await useApi(`/api/entradas/${entradaId}`)
</script>