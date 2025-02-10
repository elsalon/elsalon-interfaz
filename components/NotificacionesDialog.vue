<template>
    <ClientOnly>
        <Dialog :visible="visible" header="Notificaciones" :style="{ width: '25rem' }" position="top" :draggable="true" @update:visible="$emit('update:visible', $event)">
            <div v-if="notificaciones.length == 0 && !fetching" class="p-3 text-sm text-gray-500 text-center">
                <span>No tenés notificaciones</span>
            </div>

            <div v-for="notificacion in notificaciones">
                <NotificacionIndividual :notificacion="notificacion" @leida="handleNotificacionLeida"/>
            </div>
        
            <div v-if="fetching" class="p-3 text-sm text-gray-500 text-center">
                <span>Cargando...</span>
            </div>

            <template #footer>
                <Button v-if="mostrarBtnMarcarLeidas" label="Marcas todas leídas" outlined severity="secondary" @click="MarcarTodasLeidas" size="small" class="flex-grow"/>
                <Button v-if="notificacionRestantes>0" :label="`Cargar más (${notificacionRestantes})`" @click="FetchNotifications" size="small" class="flex-grow"/>
            </template>
            
        </Dialog>
    </ClientOnly>
</template>

<script setup>
const { notificacionSinLeer } = useNotifications()
const totalNotificaciones = ref()
const notificaciones = ref([])
const user = useAuth().data.value.user
import qs from 'qs'

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    }
})

watch(() => props.visible, (val) => {
    if(val) {
        console.log("Opened notification")
        FetchNotifications()
        // if(notificaciones.value.length == 0) {
        // }
    }
})

const mostrarBtnMarcarLeidas = computed(() => notificaciones.value.some(n => !n.leida))
const notificacionRestantes = computed(() => totalNotificaciones.value - notificaciones.value.length)
const fetching = ref(false)
const hasNextPage = ref(true);

const emit = defineEmits(['update:visible'])

const closeDialog = () => {
    emit('update:visible', false)
}

const MarcarTodasLeidas = async () => {
    console.log('Marcar todas leidas')
    await useAPI(`/api/notificaciones/todasleidas`, {method:'PATCH'})
    notificaciones.value.forEach(n => n.leida = true)
    notificacionSinLeer.value = 0
}

const FetchNotifications = async() => {
    fetching.value = true
    const query = {
        sort: 'leida',
        limit: 5,
        depth: 2,
    }
    // if(notificaciones.value.length > 0) {
    //     const lastCreatedAt = notificaciones.value[notificaciones.value.length - 1].createdAt
    //     query.where = { createdAt: { less_than: lastCreatedAt } }
    // }
    const queryParams = qs.stringify(query, { encode: false })
    const res = await useAPI(`/api/notificaciones?${queryParams}`)
    fetching.value = false
    notificaciones.value = [...notificaciones.value, ...res.docs]
    notificaciones.value.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    hasNextPage.value = res.hasNextPage;
    totalNotificaciones.value = res.totalDocs
    console.log('FetchNotifications', res)

}


const handleNotificacionLeida = (notificacion) => {
    console.log('Notificacion leida', notificacion)
    notificacionSinLeer.value--
}

</script>