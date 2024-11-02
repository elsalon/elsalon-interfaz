<template>
    <ClientOnly>
        <Dialog :visible="visible" header="Notificaciones" :style="{ width: '25rem' }" position="top" :draggable="true" @update:visible="$emit('update:visible', $event)">
            <div v-if="notificaciones.length == 0" class="p-3 ">
                <span>No hay notificaciones</span>
            </div>
            <div v-for="notificacion in notificaciones" class="p-3 m-1 " :class="{'bg-gray-100': !notificacion.leida}" >
                <div class="flex items-center justify-between">
                    <RouterLink 
                        @click.prevent="handleClick(notificacion)"
                        :to="LinkNotificacion(notificacion)"
                        class="flex items-center grow">
                        <!-- Icono ? <i class="pi mr-4" :class="[notificationIcon(notificacion.tipoNotificacion)]"></i> --> 
                        <div class="flex flex-col grow">
                            <span class="text-sm mr-2" v-html="notificacion.mensaje"></span>
                            <span class="text-muted-color text-xs">{{ $formatDate(notificacion.createdAt) }}</span>
                        </div>
                    </RouterLink>

                    <!-- Button placed outside of RouterLink to avoid triggering it -->
                    <Button 
                        v-if="!notificacion.leida"
                        icon="pi pi-eye" 
                        severity="warning" 
                        rounded 
                        aria-label="Mark as Read" 
                        class="w-7 h-7" 
                        @click="MarcarLeida(notificacion)" 
                    />
                </div>
            </div>
            <template #footer>
                
                <Button v-if="hasNextPage" label="Cargar más" @click="FetchNotifications" size="small" />
                <Button v-if="notificaciones.length>0" label="Marcas todas leídas" outlined severity="secondary" @click="MarcarTodasLeidas" size="small"/>
            </template>

            <DeferredContent @load="onEndReached"/>
        </Dialog>
    </ClientOnly>
</template>

<script setup>
const { $formatDate } = useNuxtApp()
const { totalNotifications } = useNotifications()
const notificaciones = ref([])

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    }
})

const fetching = ref(false)
const hasNextPage = ref(true);
const page = ref(1);

const emit = defineEmits(['update:visible'])
// const notificationIcon = (tipo) => {
//     switch(tipo){
//         case 'comentario':
//             return 'pi-comment'
        
//         default:
//             return 'pi-info-circle'
//     }
// }

const LinkNotificacion = (notificacion) => {
    switch(notificacion.linkType){
        case 'usuario':
            return `/usuarios/${notificacion.linkTo}`
        case 'entrada':
            return `/entradas/${notificacion.linkTo}`
        case 'grupo':
            return `/grupos/${notificacion.linkTo}`
        default:
    }
    // return `/entradas/${notificacion.linkTo.id}`
}

const handleClick = async (notificacion) => {
    // console.log('handleClick', id, notificacionId)
    await MarcarLeida(notificacion)
    this.$router.push(LinkNotificacion(notificacion));
}

const closeDialog = () => {
    emit('update:visible', false)
}

const MarcarLeida = async (notification) => {
    console.log('Marcar leida', notification.id)
    notification.leida = true
    await useAPI(`/api/notificaciones/${notification.id}`, {leida:true} ,'PATCH')
    totalNotifications.value--
}
const MarcarTodasLeidas = async () => {
    console.log('Marcar todas leidas')
    await useAPI(`/api/notificaciones/todasleidas`, {} ,'PATCH')
    notificaciones.value.forEach(n => n.leida = true)
    totalNotifications.value = 0
}

const onEndReached = () => {
    console.log('End reached')
    FetchNotifications()
}

const FetchNotifications = async() => {
    const res = await useAPI(`/api/notificaciones?limit=5&page=${page.value}`)
    notificaciones.value = [...notificaciones.value, ...res.docs]
    hasNextPage.value = res.hasNextPage;
    console.log('FetchNotifications', res)
    page.value++
}
</script>