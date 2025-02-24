<template>
    <div v-if="eventos?.docs.length == 0 && puedeEditar" class="text-center my-14">
        <p class="text-neutral-500 mb-3">Agregá eventos para visualizar la cursada en un calendario</p>
        <Button label="Crear primer evento" @click="IrEventos" size="small" />
    </div>
    <div v-if="eventos?.docs.length > 0" class="relative mt-2 mb-6 ml-4 md:ml-0 md:mb-8">
        <!-- Desktop Timeline -->
        <div class="hidden md:flex md:items-center md:justify-between">
            <!-- Horizontal line connecting first/last markers -->
            <div class="absolute left-4 right-4 h-0.5 bg-neutral-200"></div>

            <div v-for="(item, index) in eventos?.docs" :key="index"
                class="linea-item relative z-10 flex flex-col items-center"
                :class="{ 'flex-grow': index > 0 || eventos.docs.length == 1 }">
                <!-- Title -->
                <div class="mb-4 max-w-[200px] text-center h-14">
                    <div class="text-sm font-semibold text-neutral-700 line-clamp-2 break-words max-w-[7rem]">
                        {{ item.titulo }}
                    </div>
                </div>

                <!-- Marker -->
                <div class="h-4 w-4 rounded-full border-4 border-black bg-white relative top-[-27px]" ref="markers">
                </div>

                <!-- Date -->
                <div class="text-xs text-neutral-500">
                    <time :datatype="item.fecha">{{ $formatDateCorto(item.fecha) }}</time>
                </div>
            </div>
            <Button icon="pi pi-calendar" class="relative" size="small" severity="contrast" rounded
                aria-label="Bookmark" @click="IrEventos" />
        </div>

        <!-- Mobile Timeline -->
        <div class="md:hidden">
            <div v-for="(item, index) in eventos?.docs" :key="index" class="relative flex pb-2"
                :class="{ 'pb-5': index < eventos.docs.length - 1 }">
                <!-- Vertical line -->
                <div class="absolute left-[7px] top-4 bottom-0 w-0.5 bg-neutral-200">
                </div>

                <!-- Marker -->
                <div class="flex-shrink-0">
                    <div class="h-4 w-4 rounded-full border-4 border-black bg-white"></div>
                </div>

                <!-- Content -->
                <div class="ml-4 flex-1">
                    <div class="text-sm font-semibold text-neutral-700 line-clamp-2">
                        {{ item.titulo }}
                    </div>
                    <div class="mt-1 text-xs text-neutral-500">
                        {{ $formatDateCorto(item.fecha) }}
                    </div>
                </div>
            </div>

            <div class="relative flex">
                <!-- Vertical line -->
                <!-- <div class="absolute left-[7px] top-4 bottom-0 w-0.5 bg-neutral-200">
                    </div> -->
                <!-- Marker -->
                <div class="flex-shrink-0">
                    <Button icon="pi pi-calendar" class="relative left-[-11px]" size="small" severity="contrast" rounded
                        aria-label="Bookmark" @click="IrEventos" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const LIMITE_EVENTOS = 4
import { useAsyncData } from "#app";
import qs from 'qs';
const { $formatDateCorto } = useNuxtApp()
const user = useAuth().data.value.user
const puedeEditar = user.rol == 'docente' || user.isAdmin;

const props = defineProps({
    salon: {
        type: Object,
        required: true
    }
})
const cacheKey = `lineatiempo-${props.salon.id}`
let hoy = new Date();
hoy.setHours(1, 0, 0, 0);

// Fetch inicial de eventos
const queryParams = qs.stringify({
    depth: 0,
    sort: 'fecha',
    limit: LIMITE_EVENTOS,
    where: {
        and: [
            { sala: { equals: props.salon.id } },
            { fecha: { greater_than_equal: hoy } } // Solo eventos futuros
        ]
    },
}, { encode: false })
const { data: eventos } = await useAsyncData(cacheKey, () => useAPI(`/api/eventos?${queryParams}`))
const router = useRouter()
const IrEventos = () => {
    router.push(`/salones/${props.salon.slug}/eventos`)
}
</script>
