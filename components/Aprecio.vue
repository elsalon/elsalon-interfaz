<template>
    <div class="relative group/aprecio w-max">
        <Button link class="my-2 text-xs text-surface-500" :class="{'opacity-30':fetching}" style="padding: 0" :label="tooltipText"  v-tooltip.notrigger="{ html:tooltipText, autoHide: false }" @click="handleAprecioClicked" />
        <div  v-if="totalDocs>0" class="absolute bottom-7 z-50 left-0 bg-surface-0 border text-sm text-slate-400 border-surface-200 border-solid p-2 invisible group-hover/aprecio:visible" >
            <template v-for="aprecio in docs">
                <NuxtLink :to="`/usuarios/${aprecio.autor.slug}`">
                    <div class="whitespace-nowrap hover:underline">{{aprecio.autor.nombre}}</div>
                </NuxtLink>
            </template>
            <div v-if="totalDocs>docs.length">Y {{ totalDocs-docs.length }} más</div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    contenidoid: {
        type: String,
        required: true,
    },
    contenidotipo: {
        type: String,
        required: true,
    },
});
const fetching = ref(false);
const haApreciado = ref(false);
const docs = ref([]);
const totalDocs = ref(0);
const haApreciadoId = ref(null);

const FetchAprecio = async () => {
    const res = await useAPI(`/api/aprecio/${props.contenidoid}`);
    docs.value = res.docs;
    totalDocs.value = res.totalDocs;
    haApreciadoId.value = res.haApreciado;
    haApreciado.value = haApreciadoId.value != false;
    // console.log(res)
}
FetchAprecio();

const handleAprecioClicked = async () => {
    if(fetching.value){
        return;
    }
    fetching.value = true;
    try{
        if(haApreciado.value){
            // Eliminio mi aprecio
            console.log('Eliminando aprecio', props.contenidoid)
            await useAPI(`/api/aprecio/${haApreciadoId.value}`, {method: 'DELETE'})
        }else{
            // Creo un aprecio
            console.log('Creando aprecio', props.contenidoid)
            const body = {contenidoid: props.contenidoid, contenidotipo: props.contenidotipo}
            const method = 'POST'
            await useAPI(`/api/aprecio/`, {body, method})
        }
    }catch(e){
        console.log(e)
    }finally{
        FetchAprecio();
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