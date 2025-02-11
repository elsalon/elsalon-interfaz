<template>
    <ClientOnly>
        <Dialog :visible="notificacionesStore.dialogVisible" header="Notificaciones" :style="{ width: '25rem' }" position="top" :draggable="true">
            <template #closeicon>
                <Button icon="pi pi-times" severity="secondary" size="small" text @click="notificacionesStore.dialogVisible=false" />
            </template>
            <!-- @update:notificaciones.dialogVisible="$emit('update:visible', $event)" -->
            
            <div v-for="notificacion in notificacionesStore.notificaciones">
                <NotificacionIndividual :notificacion="notificacion" :key="notificacion.id"/>
            </div>
            
            <div v-if="notificacionesStore.fetching" class="p-3 text-sm text-gray-500 text-center">
                <span>Cargando notificaciones...</span>
            </div>
            <div v-else-if="notificacionesStore.notificaciones.length == 0 && !fetching" class="p-3 text-sm text-gray-500 text-center">
                <span>No tenés notificaciones</span>
            </div>

            <template #footer>
                <Button v-if="mostrarBtnMarcarLeidas" :disabled="fetching" label="Marcas todas leídas" outlined
                    severity="secondary" @click="notificacionesStore.MarcarTodasLeidas" size="small" class="flex-grow" />
                <Button v-if="notificacionesRestantes > 0" :loading="fetching"
                    :label="`Cargar más (${notificacionesRestantes})`" @click="notificacionesStore.fetchNotificacionesMas()" size="small"
                    class="flex-grow" />
            </template>

        </Dialog>
    </ClientOnly>
</template>

<script setup>
// const { notificacionesNuevas } = useNotifications()
// const totalNotificaciones = ref()
// const notificaciones = ref([])
// const user = useAuth().data.value.user

const notificacionesStore = useNotificacionesStore()

watch(() => notificacionesStore.dialogVisible, (val) => {
    if (val) {
        console.log("Opened notification")
        notificacionesStore.fetchNotificacionesTodas();
    }
})

// getter setter for visible property
const visible = ref(false)
watch(() => visible, (val) => {
    visible.value = val
})



const mostrarBtnMarcarLeidas = computed(() => notificacionesStore.notificaciones.some(n => !n.leida))
const notificacionesRestantes = computed(() => notificacionesStore.totalNotificaciones - notificacionesStore.notificaciones.length)
const fetching = ref(false)
// const hasNextPage = ref(true);

const emit = defineEmits(['update:visible'])

const closeDialog = () => {
    emit('update:visible', false)
}

// const MarcarTodasLeidas = async () => {
//     console.log('Marcar todas leidas')
//     await useAPI(`/api/notificaciones/todasleidas`, { method: 'PATCH' })
//     notificaciones.value.forEach(n => n.leida = true)
//     // notificacionesNuevas.value = 0
// }

// const FetchNotifications = async (refresh = false) => {
//     fetching.value = true
//     const query = {
//         sort: '-updatedAt',
//         limit: 5,
//         depth: 3,
//         where: {
//             and: [
//                 { autor: { equals: user.id } },
//             ]
//         }
//     }
//     if (!refresh) {
//         query.where.and.push({
//             updatedAt: {
//                 less_than_equal: notificaciones.value[notificaciones.value.length - 1]?.updatedAt || new Date() // La ultima o la fecha actual
//             }
//         })
//     }

//     const queryParams = qs.stringify(query, { encode: false })
//     const res = await useAPI(`/api/notificaciones?${queryParams}`)
//     fetching.value = false
//     notificaciones.value = [...notificaciones.value, ...res.docs]
//     // Remove duplicate
//     notificaciones.value = [...new Map(notificaciones.value.map(item => [item['id'], item])).values()]
//     notificaciones.value.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
//     hasNextPage.value = res.hasNextPage;
//     totalNotificaciones.value = res.totalDocs
//     console.log('Fetch More Notifications', res)

// }



</script>