<template>
    <div class="text-center" v-if="estadoMostrarBtnEnlace > 0">
        <Button v-if="estadoMostrarBtnEnlace==1" @click="IniciarEnlace" :loading="loading" :label="loading? 'Enlazando' : 'Enlazar'" :title="title" size="small"/>
        <Button v-if="estadoMostrarBtnEnlace==2" @click="DetenerEnlace" :loading="loading" severity="secondary" :label="loading? 'Desenlazando' : 'Desenlazar'" size="small"></Button>
    </div>
</template>

<script setup>
    const auth = useAuth()
    const SalonStore = useSalonStore()
    const toast = useToast()
    const idEnlace = ref(null)
    const estadoMostrarBtnEnlace = ref(0) // 0 no se muestra nada, 1 se muestra "enlace", 2 se muestra "desenlazar"
    const loading = ref(false)

    const props = defineProps({
        type: {
            type: String,
            default: 'sala' // sala, usuario, grupo
        }
    })

    let title;
    let detail;
    switch(props.type){
        case 'sala':
            title = "Enlazar para seguir las entradas de esta sala"
            detail = "Ahora seguís las entradas de esta sala"
            break;
        case 'usuario':
            title = "Enlazar para seguir las entradas de este usuario"
            detail = "Ahora seguís las entradas de este usuario"
            break;
        case 'grupo':
            title = "Enlazar para seguir las entradas de este grupo"
            detail = "Ahora seguís las entradas de este grupo"
            break;
    }

    const IniciarEnlace = async () =>{
        try{
            loading.value = true;
            const body = {
                autor: auth.data.value.user.id,
                tipo: SalonStore.currContext,
                idEnlazado: SalonStore.contextoId
            }
            const res = await useAPI('/api/enlaces', {body, method: 'POST'})
            estadoMostrarBtnEnlace.value = 2
            idEnlace.value = res.doc.id
            emit('estadoEnlace', estadoMostrarBtnEnlace.value)
            toast.add({severity: 'contrast', summary: 'Enlace iniciado', detail, life: 3000})
        }catch(e){
            console.log(e)
        }finally{
            loading.value = false;
        }
    }

    const DetenerEnlace = async () =>{
        try{
            loading.value = true;
            await useAPI(`/api/enlaces/${idEnlace.value}`, {method: 'DELETE'})
            estadoMostrarBtnEnlace.value = 1
            emit('estadoEnlace', estadoMostrarBtnEnlace.value)
            // toast.add({severity: 'contrast', summary: 'Desenlazado', life: 3000})
        }catch(e){
            console.log(e)
        }finally{
            loading.value = false;
        }
    }

    const emit = defineEmits(['estadoEnlace'])

    const resEnlace = await useAPI(`/api/enlaces?where[autor][equals]=${auth.data.value.user.id}&where[idEnlazado][equals]=${SalonStore.contextoId}`)
    if(resEnlace.docs.length > 0){
        idEnlace.value = resEnlace.docs[0].id
        estadoMostrarBtnEnlace.value = 2
    }else{
        estadoMostrarBtnEnlace.value = 1
    }
    emit('estadoEnlace', estadoMostrarBtnEnlace.value)

</script>