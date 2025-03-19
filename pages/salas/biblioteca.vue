<template>
    <NuxtLayout name="layout-contenido" containerType="container">
        <template #header>
            <RouterLink :to="`/`" class="link">S</RouterLink> /
            {{ salon.nombre }}
        </template>
        <div class="text-center mb-5">
            <LogoSala :salon="salon" />
        </div>

        <CrearEntradaBtn />
        <!-- TODO Query -->
        <ListaEntradas :query="query" :cacheKey="cacheKey" entradaTheme="biblioteca" :grid="3"/>
    </NuxtLayout>
</template>

<script setup>

const slug = "biblioteca"
const salonStore = useSalonStore();
const salon = ref(null)
salon.value = salonStore.salas.find(salon => salon.slug === slug)
console.log(salon.value, salon.value.id)
salonStore.setContext('salon', salon.value.id)
salonStore.SetPageTitle(salon.value.nombre)
const cacheKey = ref(`biblioteca`)

var query = {
    where: {
        and: [
            { sala: { equals: salon.value.id } },
        ]
    }
}

</script>