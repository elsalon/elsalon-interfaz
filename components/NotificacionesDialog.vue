<template>
    <ClientOnly>
        <Dialog :visible="notificacionesStore.dialogVisible" header="Notificaciones" :style="{ width: '25rem' }"
            position="top" :dismissableMask="true">
            <template #closeicon>
                <Button icon="pi pi-times" severity="secondary" size="small" text
                    @click="notificacionesStore.dialogVisible = false" />
            </template>
            <!-- @update:notificaciones.dialogVisible="$emit('update:visible', $event)" -->

            <div v-for="notificacion in notificacionesStore.notificaciones">
                <NotificacionIndividual :notificacion="notificacion" :key="notificacion.id" />
            </div>

            <div v-if="notificacionesStore.fetching" class="p-3 text-sm text-neutral-500 text-center">
                <span class="texto-cargando">Cargando notificaciones...</span>
            </div>
            <div v-else-if="notificacionesStore.notificaciones.length == 0 && !fetching"
                class="p-3 text-sm text-neutral-500 text-center">
                <span>No tenés notificaciones</span>
            </div>

            <template #footer>
                <Button v-if="mostrarBtnMarcarLeidas" :disabled="fetching" label="Marcas todas leídas" outlined
                    severity="secondary" @click="notificacionesStore.MarcarTodasLeidas" size="small"
                    class="flex-grow" />
                <Button v-if="notificacionesStore.restantes > 0" :loading="fetching"
                    :label="`Ver más (${notificacionesStore.restantes})`"
                    @click="notificacionesStore.fetchNotificacionesMas()" size="small" class="flex-grow" />
            </template>

        </Dialog>
    </ClientOnly>
</template>

<script setup>

const notificacionesStore = useNotificacionesStore()

watch(() => notificacionesStore.dialogVisible, async (val) => {
    if (val) {
        console.log("Opened notification")
        await notificacionesStore.fetchNotificacionesTodas();
        await notificacionesStore.resetNotificacionesNuevas();
    }
})

// getter setter for visible property
const visible = ref(false)
watch(() => visible, (val) => {
    visible.value = val
})

const mostrarBtnMarcarLeidas = computed(() => notificacionesStore.notificaciones.some(n => !n.leida))
const fetching = ref(false)
// const hasNextPage = ref(true);

const emit = defineEmits(['update:visible'])
</script>