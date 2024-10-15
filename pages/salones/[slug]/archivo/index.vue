<template>
    <NuxtLayout name="layout-contenido">
        <div class="text-center mb-2">
            <LogoSala :salon="salon"/>
            <h1 class="text-3xl font-bold">{{ salon.nombre }}</h1>
            <h2 class="text-xl font-bold">Archivo</h2>

            <div v-for="periodo in periodosDisponibles" :key="periodo.id">
                <NuxtLink :to="`/salones/${salon.slug}/archivo/${periodo.slug}`" :title="periodo.nombre">
                	<div>{{ periodo.nombre }}</div>
                </NuxtLink>
            </div>

        </div>
    </NuxtLayout>
</template>

<script setup>
// const estadoColaboracion = ref(false)
const route = useRoute()
const slug = route.params?.slug
const salonStore = useSalonStore();
const salon = ref(null)
salon.value = salonStore.salones.find(salon => salon.slug === slug)
salonStore.setContext('salon', salon.value.id)
const [first, ...periodosDisponibles] = salon.value.archivo.periodos; // Eliminamos el primer periodo, que es el actual


</script>