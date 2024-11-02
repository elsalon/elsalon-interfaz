<template>
    <Button v-if="!usuarioPertenece" class="h-12" type="button" label="Unirme" severity="secondary" @click="UnirmeComisionIndividuo" aria-haspopup="true" aria-controls="unirMenu" :loading="loading" />
    <Button v-if="usuarioPertenece" class="h-12" type="button" label="Abandonar" severity="secondary" @click="AbandonarComisionIndividuo" aria-haspopup="true" aria-controls="abandonarMenu" :loading="loading" />
</template>

<script setup>
const {data: authData} = useAuth()
const props = defineProps({
    comision: Object,
    required: true
});
const emit = defineEmits(['UsuarioCambioInscripcion']);
const toast = useToast();
const loading = ref(false);

const usuarioPertenece = props.comision.integrantes?.some(integrante => integrante.id == authData.value.user.id) || props.comision.docentes?.some(docente => docente.id == authData.value.user.id);

// FUNCIONES API
const UnirmeComisionIndividuo = async () =>{
    try{
        loading.value = true;
        const res = await useAPI(`/api/comisiones/${props.comision.id}/unirme`, null, 'PATCH')
        if(res.error){
            toast.add({severity: 'error', detail: res.error, life:3000});
        }else{
            emit('UsuarioCambioInscripcion');
            toast.add({severity: 'contrast', detail: 'Te uniste a la comisión', life:3000});
        }
    }catch(e){
        console.log(e)
    }finally{
        loading.value = false;
    }
}

const AbandonarComisionIndividuo = async () =>{
    try{
        loading.value = true;
        await useAPI(`/api/comisiones/${props.comision.id}/abandonar`, null, 'PATCH')
        emit('UsuarioCambioInscripcion');
        toast.add({severity: 'contrast', detail: 'Abandonaste la comisión', life:3000});
    }catch(e){
        console.log(e)
    }finally{
        loading.value = false;
    }
}

</script>