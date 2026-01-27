<template>
    <div class="relative group/guardar w-max flex mr-4">
        <!-- Btn Guardar  -->
        <div class="relative">
             <Button link class="!p-1 text-xs text-zinc-600 dark:text-zinc-400 leading-normal" :class="{ 'font-bold text-zinc-800': haGuardado }" style="padding: 0"
                 :label="tooltipText" @click="handleGuardarClicked" />
            <div v-show="showAnim" class="absolute top-[8px] left-0 text-xs text-zinc-800/80 dark:text-zinc-300/80 font-mono custom-ping">Guardado</div>
         </div>
    </div>
</template>


<script setup>
import qs from 'qs';
const { data: authData } = useAuth();
const mixpanel = useMixpanel();
const toast = useToast();

const props = defineProps({
    guardadoPorUsuario: {
        type: Boolean,
        required: true,
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

const haGuardado = ref(props.guardadoPorUsuario);

const fetching = ref(false);
const showAnim = ref(false);

const tooltipText = computed(() => {
    if (haGuardado.value) {
        return `Guardado`;
    }
    return `Guardar`;
})

const handleGuardarClicked = async () => {
    if (fetching.value) {
        return;
    }
    fetching.value = true;
    // Optimistic update: remember previous, toggle immediately
    const previousState = haGuardado.value;
    haGuardado.value = !haGuardado.value;
    let didSucceed = false;
    try {
        if (!haGuardado.value) {
            // Elimino mi guardado
            console.log('Eliminando guardado', props.contenidoid)
            const queryParams = qs.stringify({
                where: {
                    and: [
                        { contenidoid: { equals: props.contenidoid } },
                        { autor: { equals: authData.value.user.id } },
                    ]
                }
            }, { encode: false })

            const res = await useAPI(`/api/guardado?${queryParams}`, { method: 'DELETE' })
            console.log(res)
            // If no error thrown, consider success (adjust if API returns a flag)
            didSucceed = true;

            mixpanel.track('Guardado eliminado', { contenidoid: props.contenidoid, contenidotipo: props.contenidotipo })
        } else {
            // Creo un guardado
            ActivateAnim()

            console.log('Creando guardado', props.contenidoid)
            const body = { contenidoid: props.contenidoid, contenidotipo: props.contenidotipo }
            const res = await useAPI(`/api/guardado/`, { body, method: 'POST' })
            console.log(res)
            didSucceed = !!(res && res.doc && res.doc.id);

            mixpanel.track('Guardado', { contenidoid: props.contenidoid, contenidotipo: props.contenidotipo })
        }
    } catch (e) {
        console.log(e)
    } finally {
        // If the operation failed or didn't validate, revert UI to previous state
        if (!didSucceed) {
            haGuardado.value = previousState;
            toast.add({
                severity: 'error',
                summary: 'Error al guardar',
                detail: 'No se pudo completar la operación. Intentá nuevamente.',
                life: 3000
            });
        }
        fetching.value = false;
    }
}


const ActivateAnim = () => {
    showAnim.value = true;
    setTimeout(()=>{
        showAnim.value = false;
    }, 650)
}
</script>