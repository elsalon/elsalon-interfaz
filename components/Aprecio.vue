<template>
    <div class="relative group/aprecio w-max">
        <!-- Btn Aprecio -->
        <Button link class="my-2 mr-1 text-xs text-surface-500" :class="{'opacity-30':fetching}" style="padding: 0" :label="tooltipText" @click="handleAprecioClicked" /> 
        <!-- Btn Cantidad -->
        <span v-show="totalDocs == 0" class="inline-block my-2 font-mono text-xs text-surface-500" :class="{'opacity-30':fetching}" >(0)</span>
        
        <Button v-show="totalDocs>0" :title="userNamesTooltip" link class="my-2 text-xs text-surface-500" :class="{'opacity-30':fetching}" style="padding: 0" :label="`(${totalDocs})`" @click="AbrirTodosLosAprecios()" />
        
        <Dialog v-model:visible="mostrarTodosAprecios" modal header="Aprecian" :style="{ width: '25rem' }">
            <template v-if="fetching" class="text-center">Cargando...</template>
            <template v-else>
                <div class="space-y-1">
                    <div v-for="doc in docs" :key="doc.id" class="flex items-center">
                        <AvatarSalon :usuario="doc.autor" />
                        <NuxtLink :to="`/usuarios/${doc.autor.slug}`" class="ml-2">{{ doc.autor.nombre }}</NuxtLink>
                    </div>
                </div>
            </template>
        </Dialog>
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
const auth = useAuth();

const fetching = ref(false);
const docs = ref(props.aprecioIniciales.docs || []);
const totalDocs = ref(props.aprecioIniciales.totalDocs || 0);
const haApreciado = ref(false);
const haApreciadoId = ref(null);

const mostrarTodosAprecios = ref(false);
const mixpanel = useMixpanel();


const CheckUserHaApreciado = () => {
    haApreciadoId.value = docs.value?.find(doc => doc.autor.id == auth.data.value.user.id);
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
                        { autor: { equals: auth.data.value.user.id } },
                    ]
                }
            }, { encode: false })

            const res = await useAPI(`/api/aprecio?${queryParams}`, {method: 'DELETE'})
            // console.log(res)
            docs.value = docs.value.filter(doc => doc.id != haApreciadoId.value.id);
            totalDocs.value--;

            mixpanel.track('Aprecio eliminado', {contenidoid: props.contenidoid, contenidotipo: props.contenidotipo})
        }else{
            // Creo un aprecio
            console.log('Creando aprecio', props.contenidoid)
            const body = {contenidoid: props.contenidoid, contenidotipo: props.contenidotipo}
            const res = await useAPI(`/api/aprecio/`, {body, method: 'POST'})
            docs.value.push(res.doc)
            totalDocs.value++;

            mixpanel.track('Aprecio', {contenidoid: props.contenidoid, contenidotipo: props.contenidotipo})
        }
    }catch(e){
        console.log(e)
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

const AbrirTodosLosAprecios = async () => {
    mostrarTodosAprecios.value = true;
    if(totalDocs.value != docs.value.length){
        await FetchAllAprecios();
    }
}

const FetchAllAprecios = async () => {
    console.log("FetchAllAprecios")
    fetching.value = true;
    try{
        console.log('Fetching aprecio', props.contenidoid)
        const res = await useAPI(`/api/aprecio/${props.contenidoid}?limit=0`);
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

</script>