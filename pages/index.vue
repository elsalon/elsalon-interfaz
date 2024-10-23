<template>
    <NuxtLayout name="layout-contenido">
        <CrearEntradaBtn />
        <!-- TODO QUery -->
        <ListaEntradas overrideApiBase="/api/salones/feed"/>
    </NuxtLayout>
</template>



<script setup>
definePageMeta({
    title: "Inicio"
})

const SalonStore = useSalonStore();
const salonId = SalonStore.salones.find(salon => salon.slug === "el-salon").id
SalonStore.setContext('salon', salonId)
</script>

  
