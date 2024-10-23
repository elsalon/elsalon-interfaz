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

const salonStore = useSalonStore();
const salonId = salonStore.salones.find(salon => salon.slug === "el-salon").id
salonStore.setContext('salon', salonId)
salonStore.SetPageTitle("Inicio")
</script>

  
