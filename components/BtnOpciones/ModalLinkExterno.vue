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
                <!-- Btn Cancelar -->
                <Button type="submit" class="" label="Cancelar" severity="secondary" :disabled="loading"
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
    }
});

const url = ref(props.url);
const label = ref(props.label);
const orden = ref(0);
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
        console.log("Links externos:", body)
        if (props.id) {
            // Update
            const res = await useAPI(`/api/linksExternos/${props.id}`, { method: 'PUT', body })
            console.log(res)
        } else {
            // Create
            const linkRes = await useAPI(`/api/linksExternos`, { method: 'POST', body })
            console.log("Link creado", linkRes)
            // const secciones = props.salon.secciones ? props.salon.secciones.map(seccion => typeof(seccion) == 'object' ? seccion.id : seccion) : []
            const secciones = props.salon.secciones || [] 
            secciones.push({value: linkRes.doc.id, relationTo: 'linksExternos'})
            console.log(secciones)
            const salaRes = await useAPI(`/api/salas/${props.salon.id}`, { method: 'PATCH', body: { secciones }})
            console.log("Sala actualizada", salaRes)
            await useFetch(`/cache/invalidate?salaId=${props.salon.id}`);
        }
    } catch (e) {
        console.error(e)
    }
    finally {
        loading.value = false;
        updateVisible(false);
    }

}
</script>