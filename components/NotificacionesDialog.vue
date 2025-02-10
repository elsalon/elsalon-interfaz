<template>
    <ClientOnly>
        <Dialog :visible="visible" header="Notificaciones" :style="{ width: '25rem' }" position="top" :draggable="true"
            @update:visible="$emit('update:visible', $event)">
            <div v-if="notificaciones.length == 0 && !fetching" class="p-3 text-sm text-gray-500 text-center">
                <span>No tenés notificaciones</span>
            </div>

            <div v-for="notificacion in notificaciones">
                <NotificacionIndividual :notificacion="notificacion" @leida="handleNotificacionLeida" :key="notificacion.id"/>
            </div>

            <div v-if="fetching" class="p-3 text-sm text-gray-500 text-center">
                <span>Cargando...</span>
            </div>

            <template #footer>
                <Button v-if="mostrarBtnMarcarLeidas" :disabled="fetching" label="Marcas todas leídas" outlined
                    severity="secondary" @click="MarcarTodasLeidas" size="small" class="flex-grow" />
                <Button v-if="notificacionRestantes > 0" :loading="fetching"
                    :label="`Cargar más (${notificacionRestantes})`" @click="FetchNotifications" size="small"
                    class="flex-grow" />
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
    if (val) {
        console.log("Opened notification")
        FetchNotifications(true)
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
    await useAPI(`/api/notificaciones/todasleidas`, { method: 'PATCH' })
    notificaciones.value.forEach(n => n.leida = true)
    notificacionSinLeer.value = 0
}

const FetchNotifications = async (refresh = false) => {
    fetching.value = true
    const query = {
        sort: '-updatedAt',
        limit: 5,
        depth: 3,
        where: {
            and: [
                { autor: { equals: user.id } },
            ]
        }
    }
    if (!refresh) {
        query.where.and.push({
            updatedAt: {
                less_than_equal: notificaciones.value[notificaciones.value.length - 1]?.updatedAt || new Date() // La ultima o la fecha actual
            }
        })
    }

    const queryParams = qs.stringify(query, { encode: false })
    const res = await useAPI(`/api/notificaciones?${queryParams}`)
    fetching.value = false
    notificaciones.value = [...notificaciones.value, ...res.docs]
    // Remove duplicate
    notificaciones.value = [...new Map(notificaciones.value.map(item => [item['id'], item])).values()]
    notificaciones.value.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    hasNextPage.value = res.hasNextPage;
    totalNotificaciones.value = res.totalDocs
    console.log('Fetch More Notifications', res)

}


const handleNotificacionLeida = (notificacion) => {
    console.log('Notificacion leida', notificacion)
    notificacionSinLeer.value--
}

</script>