<template>
    <div class="relative" v-tooltip.bottom="'Aulas'">
        <Inplace v-if="canEdit" @open="OnOpen" :active="editing" class="block">
            <template #display>
                <span v-if="mostrarCta" class="text-muted-color text-sm">Editar Aulas</span>
                <span class="font-bold">{{ aulas }}</span>
            </template>
            <template #content>
                <span class="inline-flex items-center gap-2">
                    <InputText v-model="aulas" autofocus size="small" style="width: 150px; text-align: center;" :disabled="loading"/>
                    <Button v-if="!loading" icon="pi pi-check" text severity="contrast" @click="saveChanges" :disabled="loading" />
                    <i v-if="loading" class="pi pi-spin pi-spinner text-sm"></i>
                </span>
            </template>
        </Inplace>
        <div v-else><span class="font-bold">{{ aulas }}</span></div>
    </div>
</template>


<script setup>
const auth = useAuth()
const canEdit = auth.data.value?.user?.rol === 'docente' || auth.data.value?.user?.isAdmin
const salonStore = useSalonStore()
const toast = useToast();

const props = defineProps({
    salon: Object,
    required: true
});

const aulas = ref(props.salon.aulas);
const editing = ref(false);
const loading = ref(false);

const mostrarCta = computed(() => {
    if(!canEdit) return false
    return aulas.value === undefined || aulas.value === null || aulas.value === "";
})

const OnOpen = () => {
    editing.value = true;
}

const saveChanges = async () => {
    loading.value = true;
    try {
        const body = {aulas: aulas.value}
        await useAPI(`/api/salas/${props.salon.id}`, {body, method: 'PATCH'})
        await salonStore.invalidateSala(props.salon.id);
        toast.add({severity: 'contrast', detail: 'Aula actualizada', life: 3000})
        // Only close the inplace after the fetch is complete
        editing.value = false;
    } catch(e) {
        console.log(e)
        toast.add({severity: 'error', detail: 'Error al actualizar el aula', life: 3000})
    } finally {
        loading.value = false;
    }
}

const OnClose = () => {
    // We'll only use this for cancellation now
    if (!loading.value) {
        editing.value = false;
    }
}
</script>