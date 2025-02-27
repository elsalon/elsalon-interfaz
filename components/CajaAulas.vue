<template>
    <div class="relative" v-tooltip.bottom="'Aulas'">
        <Inplace v-if="canEdit" @open="OnOpen" @close="OnClose" class="block">
            <template #display>
                <span v-if="mostrarCta" class="text-muted-color text-sm">Editar Aulas</span>
                <span class="font-bold">{{ aulas }}</span>
            </template>
            <template #content="{ closeCallback }">
                <span class="inline-flex items-center gap-2">
                    <InputText v-model="aulas" autofocus size="small" style="width: 150px; text-align: center;"/>
                    <Button icon="pi pi-check" text severity="contrast" @click="closeCallback" />
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

const mostrarCta = computed(() => {
    if(!canEdit) return false
    return aulas.value === undefined || aulas.value === null || aulas.value === "";
})

const OnOpen = () => {
    editing.value = true;
}
const OnClose = async () =>{
    // console.log("Cerrando inplace")
    editing.value = false;
    try{
        const body = {aulas: aulas.value}
        const salonRes = await useAPI(`/api/salas/${props.salon.id}`, {body, method: 'PATCH'})
        salonStore.UpdateSala(salonRes.doc)
        toast.add({severity: 'contrast', detail: 'Aula actualizada', life: 3000})
    }catch(e){
        console.log(e)
    }
}
</script>