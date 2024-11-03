<template>
    <div class="text-center" v-if="estadoMostrarBtnColaborador > 0">
        <Button v-if="estadoMostrarBtnColaborador==1" @click="IniciarColaboracion" :loading="estadoColaboradorLoading" label="Colaborar" title="Al colaborar seguís los acontecimientos en El Salón (redactar)" size="small"/>
        <Button v-if="estadoMostrarBtnColaborador==2" @click="DetenerColaboracion" :loading="estadoColaboradorLoading" severity="secondary" label="No colaborar" size="small"></Button>
    </div>
</template>

<script setup>
    const {data: authData} = useAuth()
    const SalonStore = useSalonStore()
    const idColaboracion = ref(null)

    // console.log("Boton colaborar. Tipo:", SalonStore.currContext, SalonStore.contextoId)

    const estadoMostrarBtnColaborador = ref(0) // 0 no se muestra nada, 1 se muestra colaborar, 2 se muestra dejar de colaborar
    const estadoColaboradorLoading = ref(false)

    const IniciarColaboracion = async () =>{
        try{
            estadoColaboradorLoading.value = true;
            const body = {
                autor: authData.value.user.id,
                tipo: SalonStore.currContext,
                idColaborador: SalonStore.contextoId
            }
            const method = 'POST'
            const res = await useAPI('/api/colaboraciones', {body, method})
            estadoMostrarBtnColaborador.value = 2
            emit('estadoColaboracion', estadoMostrarBtnColaborador.value)
        }catch(e){
            console.log(e)
        }finally{
            estadoColaboradorLoading.value = false;
        }
    }

    const DetenerColaboracion = async () =>{
        try{
            estadoColaboradorLoading.value = true;
            await useAPI(`/api/colaboraciones/${idColaboracion.value}`, {method: 'DELETE'})
            estadoMostrarBtnColaborador.value = 1
            emit('estadoColaboracion', estadoMostrarBtnColaborador.value)
        }catch(e){
            console.log(e)
        }finally{
            estadoColaboradorLoading.value = false;
        }
    }

    const emit = defineEmits(['estadoColaboracion'])

    const resColaboracion = await useAPI(`/api/colaboraciones?where[autor][equals]=${authData.value.user.id}&where[idColaborador][equals]=${SalonStore.contextoId}`)
    if(resColaboracion.docs.length > 0){
        idColaboracion.value = resColaboracion.docs[0].id
        estadoMostrarBtnColaborador.value = 2
    }else{
        estadoMostrarBtnColaborador.value = 1
    }
    emit('estadoColaboracion', estadoMostrarBtnColaborador.value)

</script>