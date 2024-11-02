<template>
    <div class="relative" title="Aulas">
        <Inplace v-if="canEdit" @open="OnOpen" @close="OnClose" class="block">
            <template #display>
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
const { data: authData } = useAuth()
const canEdit = authData.value?.user?.rol === 'docente' || authData.value?.user?.isAdmin
const salonStore = useSalonStore()
const toast = useToast();

const props = defineProps({
    salon: Object,
    required: true
});

const aulas = ref(props.salon.aulas);
const editing = ref(false);

const OnOpen = () => {
    editing.value = true;
}
const OnClose = async () =>{
    // console.log("Cerrando inplace")
    editing.value = false;
    try{
        const salonRes = await useAPI(`/api/salones/${props.salon.id}`, {aulas: aulas.value}, 'PUT')
        salonStore.UpdateSala(salonRes.doc)
        toast.add({severity: 'contrast', detail: 'Aula actualizada', life: 3000})
    }catch(e){
        console.log(e)
    }
}
</script>