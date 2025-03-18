<template>
    <Dialog modal :visible="localVisible" @update:visible="updateVisible" header="Link Externo"
        :style="{ width: '25rem' }" :dismissableMask="true">
        <form @submit.prevent="Guardar">
            <div class="flex gap-2 mt-1 mb-4 flex-col md:flex-row">
                <label for="url" class="font-semibold w-1/4">url</label>
                <InputText type="url" placeholder="https://proyectoidis.org" id="url" class="w-full" v-model="url"
                    required minlength="3" autofocus />
            </div>
            <div class="flex gap-2 mt-1 mb-4 flex-col md:flex-row">
                <label for="etiqueta" class="font-semibold w-1/4">etiqueta</label>
                <InputText id="etiqueta" placeholder="Proyecto IDIS" class="w-full" v-model="label" required
                    minlength="3" />
            </div>

            <div class="flex gap-2 mt-1 mb-4 flex-col md:flex-row">
                <label for="orden" class="font-semibold w-1/4">orden</label>
                <InputText id="orden" class="w-full" v-model="orden" type="number" step="1" />
            </div>

            <div class="text-right flex justify-end gap-x-2">
                <!-- Btn Eliminar -->
                <Button v-if="props.id" type="button" class="mr-auto" label="Eliminar" severity="danger" :disabled="loading" @click="Eliminar()" />
                <!-- Btn Cancelar -->
                <Button type="button" class="" label="Cancelar" severity="secondary" :disabled="loading"
                    @click="updateVisible(false)" />
                <!-- Btn Guardar -->
                <Button type="submit" class="" label="Guardar" :loading="loading" />
            </div>
        </form>
    </Dialog>
</template>

<script setup>
const props = defineProps({
    id: {
        type: String,
        default: null
    },
    salon: {
        type: Object,
        required: true
    },
    visible: {
        type: Boolean,
        default: false
    },
    url: {
        type: String,
        default: ''
    },
    label: {
        type: String,
        default: ''
    },
    orden:{
        type: Number,
        default: 0
    }
});
const salonStore = useSalonStore();
const url = ref(props.url);
const label = ref(props.label);
const orden = ref(props.orden);
const user = useAuth().data.value.user;

const loading = ref(false);
// Define emits to update parent
const emit = defineEmits(['update:visible']);

// Local state that syncs with parent
const localVisible = ref(props.visible);

// Watch for changes from parent
watch(() => props.visible, (newValue) => {
    localVisible.value = newValue;
});

// Update local state and emit change to parent
function updateVisible(value) {
    localVisible.value = value;
    emit('update:visible', value);
}

const Guardar = async () => {
    loading.value = true;
    try {
        if (!url.value || !label.value) {
            loading.value = false;
            return;
        }
        const body = {
            url: url.value,
            label: label.value,
            orden: orden.value,
            autor: user.id,
        }
        if (props.id) {
            // Update
            await useAPI(`/api/linksExternos/${props.id}`, { method: 'PUT', body })
        } else {
            // Create
            const linkRes = await useAPI(`/api/linksExternos`, { method: 'POST', body })
            // Agrego la nueva sección
            let secciones = props.salon.secciones?.length ? props.salon.secciones.map(item => ({ value: item.value.id, relationTo: item.relationTo })) : []
            secciones.push({ value: linkRes.doc.id, relationTo: 'linksExternos' })
            // Actualizo la sala
            await useAPI(`/api/salas/${props.salon.id}`, { method: 'PATCH', body: { secciones } })
        }
        // Invalido el cache para refrescar
        await salonStore.invalidateSala(props.salon.id);
        url.value = '';
        label.value = '';
        orden.value = 0;
    } catch (e) {
        console.error(e)
    }
    finally {
        loading.value = false;
        updateVisible(false);
    }
}

const Eliminar = async () => {
    loading.value = true;
    try {
        await useAPI(`/api/linksExternos/${props.id}`, { method: 'DELETE' })
        // Elimino la sección
        let secciones = props.salon.secciones?.length ? props.salon.secciones.map(item => ({ value: item.value.id, relationTo: item.relationTo })) : []
        secciones = secciones.filter(item => item.value !== props.id);
        // Actualizo la sala
        await useAPI(`/api/salas/${props.salon.id}`, { method: 'PATCH', body: { secciones } })
        // Invalido el cache para refrescar
        await salonStore.invalidateSala(props.salon.id);
    } catch (e) {
        console.error(e)
    }
    finally {
        loading.value = false;
        updateVisible(false);
    }
}
</script>