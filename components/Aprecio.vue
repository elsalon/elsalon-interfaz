<template>
    <div class="relative group/aprecio w-max">
        <!-- Btn Aprecio -->
        <Button link class="my-2 mr-1 text-xs text-surface-500" :class="{'opacity-30':fetching}" style="padding: 0" :label="tooltipText" @click="handleAprecioClicked" /> 
        <!-- Btn Cantidad -->
        <span v-show="totalDocs == 0" class="inline-block my-2 font-mono text-xs text-surface-500" :class="{'opacity-30':fetching}" >(0)</span>
        
        <Button v-show="totalDocs>0" :title="userNamesTooltip" link class="my-2 text-xs text-surface-500" :class="{'opacity-30':fetching}" style="padding: 0" :label="`(${totalDocs})`" @click="mostrarTodosAprecios=true" />
        
            <!-- {{ aprecioIniciales }} -->
        <Dialog v-model:visible="mostrarTodosAprecios" modal header="Aprecios" :style="{ width: '25rem' }">
            hola
        </Dialog>
        <!-- tooltipText -->
        <!-- <div  v-if="totalDocs > 0" class="absolute bottom-7 z-50 left-0 bg-surface-0 border text-sm text-slate-400 border-surface-200 border-solid p-2 invisible group-hover/aprecio:visible" > -->
            <!-- <template v-for="aprecio in docs">
                <NuxtLink :to="`/usuarios/${aprecio.autor.slug}`">
                    <div class="whitespace-nowrap hover:underline">{{aprecio.autor.nombre}}</div>
                </NuxtLink>
            </template> -->
            <!-- <div v-if="totalDocs>docs.length">Y {{ totalDocs-docs.length }} más</div> -->
        <!-- </div> -->
    </div>
</template>

<script setup>
import qs from 'qs';
const props = defineProps({
    aprecioIniciales: {
        type: Object,
        default: {totalDocs: 0, haApreciado: false},
    },
    contenidoid: {
        type: String,
        required: true,
    },
    contenidotipo: {
        type: String,
        required: true,
    },
});
const {data: authData} = useAuth();

const fetching = ref(false);
const docs = ref(props.aprecioIniciales.docs || []);
const totalDocs = ref(props.aprecioIniciales.totalDocs || 0);
const haApreciado = ref(false);
const haApreciadoId = ref(null);

const mostrarTodosAprecios = ref(false);

const CheckUserHaApreciado = () => {
    haApreciadoId.value = docs.value?.find(doc => doc.autor.id == authData.value.user.id);
    haApreciado.value = haApreciadoId.value != null;
}

CheckUserHaApreciado();

const handleAprecioClicked = async () => {
    if(fetching.value){
        return;
    }
    fetching.value = true;
    try{
        if(haApreciado.value){
            // Eliminio mi aprecio
            console.log('Eliminando aprecio', props.contenidoid)
            const queryParams = qs.stringify({
                where: {
                    and: [
                        { contenidoid: { equals:  props.contenidoid } },
                        { autor: { equals: authData.value.user.id } },
                    ]
                }
            }, { encode: false })

            const res = await useAPI(`/api/aprecio?${queryParams}`, {method: 'DELETE'})
            // console.log(res)
            docs.value = docs.value.filter(doc => doc.id != haApreciadoId.value.id);
            totalDocs.value--;
        }else{
            // Creo un aprecio
            console.log('Creando aprecio', props.contenidoid)
            const body = {contenidoid: props.contenidoid, contenidotipo: props.contenidotipo}
            const res = await useAPI(`/api/aprecio/`, {body, method: 'POST'})
            docs.value.push(res.doc)
            totalDocs.value++;
        }
    }catch(e){
        console.log(e)
    }finally{
        CheckUserHaApreciado();
        fetching.value = false;
    }
}

const FetchAprecio = async () => {
    fetching.value = true;
    try{
        console.log('Fetching aprecio', props.contenidoid)
        const res = await useAPI(`/api/aprecio/${props.contenidoid}`);
        console.log(res)
        docs.value = res.docs;
        totalDocs.value = res.totalDocs;
    }catch(e){
        console.warn(e)
    }finally{
        CheckUserHaApreciado();
        fetching.value = false;
    }
}

// Computed
const tooltipText = computed(() => {
    if(haApreciado.value){
        return `Ya no aprecio`;
    }
    return `Aprecio`;
})

const cantUserNames = 3;
const userNamesTooltip = computed(() => {
    if(docs.value.length == 1){
        return docs.value[0].autor.nombre + " aprecia esto";
    }
    let txt = docs.value.slice(0, cantUserNames).map(doc => doc.autor.nombre).join(', ');
    if(docs.value.length > cantUserNames){
        txt += ` y ${docs.value.length - cantUserNames} más`;
    }
    txt += " aprecian esto";
    return txt;
})

</script>