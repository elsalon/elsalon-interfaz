<template>
    <Inplace v-if="canEdit" @close="OnClose">
        <template #display>
            {{ aulas }}
        </template>
        <template #content="{ closeCallback }">
            <span class="inline-flex items-center gap-2">
                <InputText v-model="aulas" autofocus size="small" style="width: 150px; text-align: center;"/>
                <Button icon="pi pi-check" text severity="contrast" @click="closeCallback" />
            </span>
        </template>
    </Inplace>
    <div v-else>{{aulas}}</div>
</template>


<script setup>
const { data: authData } = useAuth()
const canEdit = authData.value?.user?.role === 'docente' || authData.value?.user?.isAdmin
const salonStore = useSalonStore()
const toast = useToast();

const props = defineProps({
    salon: Object,
    required: true
});

const aulas = ref(props.salon.aulas);

const OnClose = async () =>{
    // console.log("Cerrando inplace")
    try{
        const salonRes = await useApi(`/api/salones/${props.salon.id}`, {aulas: aulas.value}, 'PUT')
        salonStore.UpdateSala(salonRes.doc)
        toast.add({severity: 'contrast', summary: 'Aula', detail: 'Aula actualizada', life: 3000})
    }catch(e){
        console.log(e)
    }
}
</script>