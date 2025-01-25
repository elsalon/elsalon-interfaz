<template>
    <ClientOnly>
        <Dialog :visible="visible" header="Notificaciones" :style="{ width: '25rem' }" position="top" :draggable="true" @update:visible="$emit('update:visible', $event)">
            <template v-if="fetching">
                <div class="p-3 text-sm text-gray-500">
                    <span>Cargando...</span>
                </div>
            </template>
            <template v-else>
                <div v-if="notificaciones.length == 0" class="p-3 text-sm text-gray-500">
                    <span>No hay notificaciones</span>
                </div>

                <div v-for="notificacion in notificaciones">
                    <NotificacionIndividual :notificacion="notificacion" @leida="handleNotificacionLeida"/>
                </div>
            </template>
            <template #footer>
                
                <Button v-if="hasNextPage" label="Cargar más" @click="FetchNotifications" size="small" />
                <Button v-if="mostrarBtnMarcarLeidas" label="Marcas todas leídas" outlined severity="secondary" @click="MarcarTodasLeidas" size="small"/>
            </template>

            <DeferredContent @load="onEndReached"/>
        </Dialog>
    </ClientOnly>
</template>

<script setup>
const { totalNotifications } = useNotifications()
const notificaciones = ref([])

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    }
})

const mostrarBtnMarcarLeidas = computed(() => notificaciones.value.some(n => !n.leida))

const fetching = ref(false)
const hasNextPage = ref(true);
const page = ref(1);

const emit = defineEmits(['update:visible'])

const closeDialog = () => {
    emit('update:visible', false)
}

const MarcarTodasLeidas = async () => {
    console.log('Marcar todas leidas')
    await useAPI(`/api/notificaciones/todasleidas`, {method:'PATCH'})
    notificaciones.value.forEach(n => n.leida = true)
    totalNotifications.value = 0
}

const onEndReached = () => {
    console.log('End reached')
    FetchNotifications()
}

const FetchNotifications = async() => {
    fetching.value = true
    const res = await useAPI(`/api/notificaciones?limit=5&page=${page.value}`)
    fetching.value = false
    notificaciones.value = [...notificaciones.value, ...res.docs]
    hasNextPage.value = res.hasNextPage;
    console.log('FetchNotifications', res)
    page.value++

}

const CrearTextoNotificacion = (notificacion) => {
    // Acá un cuadro de las posibles combinaciones de notificaciones
    // https://docs.google.com/spreadsheets/d/108Jejdou-WqEw8dVV39WaclI3UjnE-h7x6LyYGMvup0/edit?usp=sharing
    
}

const handleNotificacionLeida = (notificacion) => {
    console.log('Notificacion leida', notificacion)
    totalNotifications.value--
}
</script>