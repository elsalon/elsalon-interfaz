<template>
    <Button v-if="!usuarioPertenece" type="button" label="Unir a comisión" severity="contrast" @click="UnirmeComisionIndividuo" aria-haspopup="true" aria-controls="unirMenu" iconPos="right" :disabled="loading" />
    <Button v-if="usuarioPertenece" type="button" label="Abandonar comisión" size="small" severity="secondary" @click="AbandonarComisionIndividuo" aria-haspopup="true" aria-controls="abandonarMenu" iconPos="right" :loading="loading" />
</template>

<script setup>
const auth = useAuth()
const props = defineProps({
    comision: Object,
    required: true
});
const emit = defineEmits(['UsuarioCambioInscripcion']);
const toast = useToast();
const loading = ref(false);

const usuarioPertenece = props.comision.integrantes?.some(integrante => integrante.id == auth.data.value.user.id) || props.comision.docentes?.some(docente => docente.id == auth.data.value.user.id);

// FUNCIONES API
const UnirmeComisionIndividuo = async () =>{
    try{
        loading.value = true;
        const res = await useAPI(`/api/comisiones/${props.comision.id}/unirme`, {method: 'PATCH'})
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
        await useAPI(`/api/comisiones/${props.comision.id}/abandonar`, {method: 'PATCH'})
        emit('UsuarioCambioInscripcion');
        toast.add({severity: 'contrast', detail: 'Abandonaste la comisión', life:3000});
    }catch(e){
        console.log(e)
    }finally{
        loading.value = false;
    }
}

</script>