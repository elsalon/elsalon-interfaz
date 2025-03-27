<template>
    <Dialog modal :visible="localVisible" @update:visible="updateVisible" header="Página"
        :style="{ width: '25rem' }" :dismissableMask="true">
        <form @submit.prevent="Guardar">
            <div class="flex gap-2 mt-1 mb-4 flex-col md:flex-row items-center ">
                <label for="titulo" class="font-semibold w-1/4">título</label>
                <InputText id="titulo" placeholder="Notas finales" class="w-full" v-model="titulo" required
                    minlength="3" />
            </div>

            <div class="flex gap-2 mt-1 mb-4 flex-col md:flex-row items-center">
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
    titulo: {
        type: String,
        default: ''
    },
    orden:{
        type: Number,
        default: 0
    }
});

const router = useRouter();
const salonStore = useSalonStore();
const titulo = ref(props.titulo);
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
        if (!titulo.value) {
            loading.value = false;
            return;
        }
        const body = {
            nombre: titulo.value,
            orden: orden.value,
            autor: user.id,
            sala: props.salon.id,
            componente: [{
                blockType: 'pagina'
            }]
        }
        let res = null;
        if (props.id) {
            // Update
            await useAPI(`/api/secciones/${props.id}`, { method: 'PUT', body })
        } else {
            // Create
            res = await useAPI(`/api/secciones`, { method: 'POST', body })
        }
        // Invalido el cache para refrescar
        await salonStore.invalidateSala(props.salon.id);
        titulo.value = '';
        orden.value = 0;
        if(res){
            router.push(`/salas/${props.salon.slug}/pagina/${res.doc.slug}`)
        }
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
        await useAPI(`/api/secciones/${props.id}`, { method: 'DELETE' })
        // Elimino la sección
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