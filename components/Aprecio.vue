<template>
    <div class="relative group/aprecio w-max">
        <Button link class="my-2 text-xs text-surface-500" :class="{'text-surface-200':fetching}" style="padding: 0" :label="tooltipText"  v-tooltip.notrigger="{ html:tooltipText, autoHide: false }" @click="handleAprecioClicked" />
        <div  v-if="totalDocs>0" class="absolute bottom-7 z-50 left-0 bg-surface-0 border text-sm text-slate-400 border-surface-200 border-solid p-2 invisible group-hover/aprecio:visible" >
            <template v-for="aprecio in docs">
                <div>{{aprecio.autor.nombre}}</div>
            </template>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    entradaId: {
        type: String,
        required: true,
    },
});
const fetching = ref(false);
const haApreciado = ref(false);
const docs = ref([]);
const totalDocs = ref(0);
const haApreciadoId = ref(null);

const FetchApreciaciones = async () => {
    const res = await useApi(`/api/apreciaciones/${props.entradaId}`);
    docs.value = res.docs;
    totalDocs.value = res.totalDocs;
    haApreciadoId.value = res.haApreciado;
    haApreciado.value = haApreciadoId.value != false;
    // console.log(res)
}
FetchApreciaciones();

const handleAprecioClicked = async () => {
    if(fetching.value){
        return;
    }
    fetching.value = true;
    try{
        if(haApreciado.value){
            // Eliminio mi aprecio
            console.log('Eliminando aprecio', props.entradaId)
            await useApi(`/api/apreciaciones/${haApreciadoId.value}`, {}, 'DELETE')
        }else{
            // Creo un aprecio
            console.log('Creando aprecio', props.entradaId)
            await useApi(`/api/apreciaciones/`, {entrada:props.entradaId}, 'POST')
        }
    }catch(e){
        console.log(e)
    }finally{
        FetchApreciaciones();
        fetching.value = false;
    }
}

// Computed
const tooltipText = computed(() => {
    if(haApreciado.value){
        return `Ya no aprecio (${totalDocs.value})`;
    }
    return `Aprecio (${totalDocs.value})`;
})
</script>