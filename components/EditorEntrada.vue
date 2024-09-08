<template>
    <div>
        <Button class="bg-black text-white" label="+ Escribir" @click="abrirEditor" />
    </div>
</template>

<script setup>

import { useDialog } from 'primevue/usedialog';

const dialog = useDialog();

const dynamicComponent = defineAsyncComponent(() => import('./EditorEntradaModal.vue'));

const abrirEditor = () => {
    dialog.open(dynamicComponent, {});
}

</script>