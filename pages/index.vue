<template>
    <NuxtLayout name="layout-contenido">
        <template #header>El Salón</template>
        <CrearEntradaBtn />
        <!-- TODO QUery -->
        <ListaEntradas apiUrl="/api/salones/feed" :cacheKey="cacheKey"/>
    </NuxtLayout>
</template>

<script setup>
definePageMeta({
    title: "Inicio",
})
const {data: authData} = useAuth();
const cacheKey = ref(`elsalon-${authData.value.user.id}`)
const salonStore = useSalonStore();
const elsalon = salonStore.salones.find(salon => salon.slug === "el-salon")
if(!elsalon){
    console.error("No se encontró salón con slug 'el-salon'", salonStore.salones)
    
}
const salonId = elsalon.id
salonStore.setContext('salon', salonId)
salonStore.SetPageTitle("Inicio")
</script>

  
