<template>
        <Inplace v-if="canEdit" @open="OnOpen" @close="OnClose" class="inline">
            <template #display>
                {{ nombre }}
            </template>
            <template #content="{ closeCallback }">
                <span class="inline-flex items-center gap-2">
                    <InputText v-model="nombre" autofocus size="small" style="width: 150px; text-align: center;"/>
                    <Button icon="pi pi-check" text severity="contrast" @click="closeCallback" />
                </span>
            </template>
        </Inplace>
        <span v-else>{{ nombre }}</span>
</template>


<script setup>
const auth = useAuth()
const canEdit = auth.data.value?.user?.rol === 'docente' || auth.data.value?.user?.isAdmin
const salonStore = useSalonStore()
const toast = useToast();

const props = defineProps({
    comision: Object,
    required: true
});
const nombre = ref(props.comision.nombre);

const editing = ref(false);

const OnOpen = () => {
    editing.value = true;
}
const OnClose = async () =>{
    // console.log("Cerrando inplace")
    editing.value = false;
    try{
        const body = {nombre: nombre.value}
        await useAPI(`/api/comisiones/${props.comision.id}`, {body, method: "PUT"})
        toast.add({severity: 'contrast', detail: 'Comisión actualizada', life: 3000})
    }catch(e){
        console.log(e)
    }
}
</script>