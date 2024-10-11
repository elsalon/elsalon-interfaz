<template>
    <div class="text-center mb-5" v-if="estadoMostrarBtnColaborador > 0">
        <Button v-if="estadoMostrarBtnColaborador==1" @click="IniciarColaboracion" :loading="estadoColaboradorLoading" label="Colaborar" title="Al colaborar seguís los acontecimientos en El Salón (redactar)"/>
        <Button v-if="estadoMostrarBtnColaborador==2" @click="DetenerColaboracion" :loading="estadoColaboradorLoading" severity="secondary" label="Dejar de colaborar"></Button>
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
            const res = await useApi('/api/colaboraciones', {autor: authData.value.user.id, tipo: SalonStore.currContext, idColaborador: SalonStore.contextoId}, 'POST')
            estadoMostrarBtnColaborador.value = 2
        }catch(e){
            console.log(e)
        }finally{
            estadoColaboradorLoading.value = false;
        }
    }

    const DetenerColaboracion = async () =>{
        try{
            estadoColaboradorLoading.value = true;
            await useApi(`/api/colaboraciones/${idColaboracion.value}`, null, 'DELETE')
            estadoMostrarBtnColaborador.value = 1
        }catch(e){
            console.log(e)
        }finally{
            estadoColaboradorLoading.value = false;
        }
    }

    onMounted(async() => {    
        const resColaboracion = await useApi(`/api/colaboraciones?where[autor][equals]=${authData.value.user.id}&where[idColaborador][equals]=${SalonStore.contextoId}`)
        if(resColaboracion.docs.length > 0){
            idColaboracion.value = resColaboracion.docs[0].id
            estadoMostrarBtnColaborador.value = 2
        }else{
            estadoMostrarBtnColaborador.value = 1
        }
    })
</script>