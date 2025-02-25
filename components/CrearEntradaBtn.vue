<template>
    <Button id="btnEscribir" label="+ Escribir" @click="AbrirEditor" />

    <Dialog
        ref="maxDialog"
        v-model:visible="visible"
        :header="editContent !== null ? 'Editar entrada' : 'Nueva entrada'"
        class="w-full md:w-5/6"
        @show="biggifyDialog"
        :blockScroll="true"
        :pt="{header: ['container-small flex justify-between w-full items-center dark:text-surface-0/80']}">
        <CrearEntradaDrawer :entryEdit="editContent"/>
    </Dialog>
</template>

<script setup>
const { hooks } = useNuxtApp()
const toast = useToast();
import { useToast } from "primevue/usetoast";
const visible = ref(false);
const editContent = ref(null);
let removeOnCreateHook = null;
let removeOnEditHook = null;
let removeOnEditFinishHook = null;

const maxDialog = ref();

function biggifyDialog() {
    maxDialog.value.maximized = true;
}

const AbrirEditor = () => {
    editContent.value = null;
    visible.value = true;
}

onMounted(() => {
    removeOnCreateHook = hooks.hook('publicacion:creada', handlePublicacionCreada)
    removeOnEditHook = hooks.hook('publicacion:editar', handlePublicacionEditar);
    removeOnEditFinishHook = hooks.hook('publicacion:editada', handlePublicacionEditada);
});

onUnmounted(() => {
    if (removeOnCreateHook) removeOnCreateHook()
    if(removeOnEditHook) removeOnEditHook()
    if(removeOnEditFinishHook) removeOnEditFinishHook()
});

const handlePublicacionCreada = (data) => {
    if(data.resultado == "ok"){
        // Publicacion exitosa. Cierro el dialogo y muestro un toast
        visible.value = false;
        toast.add({ severity: 'contrast', detail: 'Entrada publicada', life: 3000});   
    }else{
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo publicar la entrada', life: 3000});
    }
}
const handlePublicacionEditar = (data) => {
    visible.value = true;
    editContent.value = data;
}
const handlePublicacionEditada = (data) => {
    if(data.resultado == "ok"){
        // Publicacion exitosa. Cierro el dialogo y muestro un toast
        visible.value = false;
        toast.add({ severity: 'contrast', detail: 'Entrada editada', life: 3000});   
    }else{
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo editar la entrada', life: 3000});
    }
}

const handleHotkey = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    publish()
    }
}



</script>
<style scoped lang="scss">
#btnEscribir{
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
}
</style>