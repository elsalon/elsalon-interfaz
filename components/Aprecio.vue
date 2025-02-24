<template>
    <div class="relative group/aprecio w-max flex">
        <!-- Btn Aprecio -->
         <div class="relative">
             <Button link class="my-2 mr-1 text-xs text-zinc-500 leading-normal" :class="{ 'font-bold text-zinc-800': haApreciadoShowState }" style="padding: 0"
                 :label="tooltipText" @click="handleAprecioClicked" />
            <div v-show="showAnim" class="absolute top-[8px] left-0 text-xs text-zinc-800/80 font-mono animate-[ping_1.5s_ease-out_infinite]">Aprecio</div>
         </div>
        <!-- Btn Cantidad -->
        <div v-show="totalDocs == 0" class="inline-block my-2 font-mono text-xs  text-zinc-500  leading-normal"
            :class="{ 'opacity-30': fetching }">(0)</div>

        <Button v-show="totalDocs > 0" v-tooltip.top="userNamesTooltip"  link class="my-2 text-xs  text-zinc-500  leading-normal"
            :class="{ 'opacity-30': fetching }" style="padding: 0" :label="`(${totalDocs})`"
            @click="AbrirTodosLosAprecios()" />

        <!-- {{ aprecioIniciales }} -->
        <Dialog v-model:visible="mostrarTodosAprecios" modal header=" " :style="{ width: '25rem' }"
            :dismissableMask="true">
            <template v-if="fetching" class="text-center">
                <span class="texto-cargando">
                    Cargando...
                </span>
            </template>
            <template v-else>
                <div class="grid grid-cols-1 md:grid-cols-2">
                    <NuxtLink v-for="doc in docs" :key="doc.id" :to="`/usuarios/${doc.autor.slug}`"
                        class="flex gap-2 items-center p-1 hover:bg-zinc-100">
                        <AvatarSalon :usuario="doc.autor" />
                        {{ doc.autor.nombre }}
                    </NuxtLink>
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
        default: { totalDocs: 0, haApreciado: false },
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
const { data: authData } = useAuth();

const fetching = ref(false);
const docs = ref(props.aprecioIniciales.docs || []);
const totalDocs = ref(props.aprecioIniciales.totalDocs || 0);
const haApreciado = ref(false);
const haApreciadoShowState = ref(false)
const showAnim = ref(false)
const haApreciadoId = ref(null);

const mostrarTodosAprecios = ref(false);
const mixpanel = useMixpanel();


const CheckUserHaApreciado = () => {
    haApreciadoId.value = docs.value?.find(doc => doc.autor.id == authData.value.user.id);
    haApreciado.value = haApreciadoId.value != null;
    haApreciadoShowState.value = haApreciado.value
}

CheckUserHaApreciado();

const ActivateAnim = () => {
    showAnim.value = true;
    setTimeout(()=>{
        showAnim.value = false;
    }, 1500)
}

const handleAprecioClicked = async () => {
    if (fetching.value) {
        return;
    }
    fetching.value = true;
    haApreciadoShowState.value = !haApreciadoShowState.value; // toggle
    if(haApreciadoShowState.value){
        ActivateAnim()
    }
    try {
        if (haApreciado.value) {
            // Eliminio mi aprecio
            console.log('Eliminando aprecio', props.contenidoid)
            const queryParams = qs.stringify({
                where: {
                    and: [
                        { contenidoid: { equals: props.contenidoid } },
                        { autor: { equals: authData.value.user.id } },
                    ]
                }
            }, { encode: false })

            const res = await useAPI(`/api/aprecio?${queryParams}`, { method: 'DELETE' })
            // console.log(res)
            docs.value = docs.value.filter(doc => doc.id != haApreciadoId.value.id);
            totalDocs.value--;

            mixpanel.track('Aprecio eliminado', { contenidoid: props.contenidoid, contenidotipo: props.contenidotipo })
        } else {
            // Creo un aprecio
            console.log('Creando aprecio', props.contenidoid)
            const body = { contenidoid: props.contenidoid, contenidotipo: props.contenidotipo }
            const res = await useAPI(`/api/aprecio/`, { body, method: 'POST' })
            docs.value.push(res.doc)
            totalDocs.value++;

            mixpanel.track('Aprecio', { contenidoid: props.contenidoid, contenidotipo: props.contenidotipo })
        }
    } catch (e) {
        console.log(e)
    } finally {
        CheckUserHaApreciado();
        fetching.value = false;
    }
}

// Computed
const tooltipText = computed(() => {
    if (haApreciadoShowState.value) {
        return `Aprecio`;
    }
    return `Apreciar`;
})

const cantUserNames = 3;
const userNamesTooltip = computed(() => {
    if (docs.value.length == 1) {
        return docs.value[0].autor.nombre + " aprecia esto";
    }
    let txt = docs.value.slice(0, cantUserNames).map(doc => doc.autor.nombre).join(', ');
    if (docs.value.length > cantUserNames) {
        txt += ` y ${docs.value.length - cantUserNames} más`;
    }
    txt += " aprecian esto";
    return txt;
})

const AbrirTodosLosAprecios = async () => {
    mostrarTodosAprecios.value = true;
    if (totalDocs.value != docs.value.length) {
        await FetchAllAprecios();
    }
}

const FetchAllAprecios = async () => {
    console.log("FetchAllAprecios")
    fetching.value = true;
    try {
        console.log('Fetching aprecio', props.contenidoid)
        const res = await useAPI(`/api/aprecio/${props.contenidoid}?limit=0`);
        console.log(res)
        docs.value = res.docs;
        totalDocs.value = res.totalDocs;
    } catch (e) {
        console.warn(e)
    } finally {
        CheckUserHaApreciado();
        fetching.value = false;
    }
}

</script>

<style>
@keyframes slow-ping {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.4);
  }
  100% {
    opacity: 0;
    transform: scale(2);
  }
}

.custom-ping {
  animation: slow-ping 2s ease-out;
}
</style>