<template>
    <div class="relative mt-2 mb-6 ml-4 md:ml-0 md:mb-8">
        <!-- Desktop Timeline -->
        <div class="hidden md:flex md:items-center md:justify-between">
            <!-- Horizontal line connecting first/last markers -->
            <div class="absolute left-4 right-4 h-0.5 bg-gray-200" :style="`top: ${markerPosition}px`"></div>

            <div v-for="(item, index) in items" :key="index"
                class="linea-item relative z-10 flex flex-col items-center">
                <!-- Title -->
                <div class="mb-4 max-w-[200px] text-center h-14">
                    <div class="text-sm font-semibold text-gray-700 line-clamp-2 break-words">
                        {{ truncateTitle(item.title) }}
                    </div>
                </div>

                <!-- Marker -->
                <div class="h-4 w-4 rounded-full border-4 border-black bg-white relative top-[-27px]" ref="markers">
                </div>

                <!-- Date -->
                <div class="text-xs text-gray-500">
                    {{ item.date }}
                </div>
            </div>

            
            <!-- <Button icon="pi pi-bookmark" severity="secondary" rounded aria-label="Bookmark" size="small"/> -->
             
            <!-- <Button icon="pi pi-calendar" class="bg-white hover:bg-white" severity="secondary" variant="text" rounded aria-label="Bookmark" text/> -->
            <Button icon="pi pi-calendar" class="relative" size="small" severity="contrast" rounded aria-label="Bookmark" @click="IrAgenda"/>
            <!-- <Button class="absolute" icon="pi pi-check" size="small" label="Ver más" /> -->
        </div>

        <!-- Mobile Timeline -->
        <div class="md:hidden">
            <div v-for="(item, index) in items" :key="index" class="relative flex pb-2" :class="{ 'pb-5': index < items.length - 1 }">
                <!-- Vertical line -->
                <div class="absolute left-[7px] top-4 bottom-0 w-0.5 bg-gray-200">
                </div>

                <!-- Marker -->
                <div class="flex-shrink-0">
                    <div class="h-4 w-4 rounded-full border-4 border-black bg-white"></div>
                </div>

                <!-- Content -->
                <div class="ml-4 flex-1">
                    <div class="text-sm font-semibold text-gray-700 line-clamp-2">
                        {{ truncateTitle(item.title) }}
                    </div>
                    <div class="mt-1 text-xs text-gray-500">
                        {{ item.date }}
                    </div>
                </div>
            </div>

            <div class="relative flex">
                <!-- Vertical line -->
                <!-- <div class="absolute left-[7px] top-4 bottom-0 w-0.5 bg-gray-200">
                </div> -->
                <!-- Marker -->
                <div class="flex-shrink-0">
                    <!-- <Button icon="pi pi-calendar" severity="secondary" rounded aria-label="Bookmark" /> -->
                    <Button icon="pi pi-calendar" class="relative left-[-11px]" size="small" severity="contrast" rounded aria-label="Bookmark" @click="IrAgenda" />
                    <!-- <div class="h-4 w-4 rounded-full border-4 border-black bg-white"></div> -->
                </div>
                
            </div>
            <!-- <Button icon="pi pi-calendar " class="relative left-[-14px] mt-3" severity="secondary"  rounded aria-label="Bookmark"  label="Ver más"/> -->
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

//   const props = defineProps({
//     items: {
//       type: Array,
//       required: true,
//       validator: (items) => items.every(item => item.title && item.date)
//     }
//   })
const items = ref([
    { title: 'Preentrega Viaje', date: '20 Mayo' },
    { title: 'Entrega Final y Visualización de trailers', date: '27 Mayo' },
    { title: 'Devolución ', date: '05 Junio' },
    // { title: 'Cierre Actas, Firma Libretas', date: '12 Junio' }
])

const markers = ref([])
const markerPosition = ref(null)

onMounted(() => {
    // if (markers.value.length > 0) {
    //   const firstMarker = markers.value[0]
    //   const rect = firstMarker.getBoundingClientRect()
    //   markerPosition.value = rect.top + rect.height/2 - firstMarker.parentElement.parentElement.getBoundingClientRect().top
    // }
})

const router = useRouter();
const IrAgenda = () => {
    navigateTo('./agenda', { replace: true })
}

const truncateTitle = (title) => {
    const maxLength = 60;
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
};
</script>