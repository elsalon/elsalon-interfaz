<template>
    <NuxtLayout name="layout-contenido">
        <div class="text-center">
            <LogoSala :salon="salon"/>
            <NuxtLink class="text-3xl font-bold" :to="`/salones/${salon.slug}`"><h1>{{ salon.nombre }}</h1></NuxtLink>
            <h2 class="text-xl font-bold">Archivo</h2>
        
            <div class="mt-10">
                <div v-for="periodo in periodosDisponibles" :key="periodo.id" class="mb-3">
                    <NuxtLink :to="`/salones/${salon.slug}/archivo/${periodo.slug}`" class="normalLink" :title="periodo.nombre">{{ periodo.nombre }}</NuxtLink>
                </div>
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