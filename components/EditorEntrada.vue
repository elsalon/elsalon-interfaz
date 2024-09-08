<template>
    <Button id="btnEscribir" class=" bg-black text-white" label="+ Escribir" @click="abrirEditor" />
</template>

<script setup>

import { useDialog } from 'primevue/usedialog';

const dialog = useDialog();

const dynamicComponent = defineAsyncComponent(() => import('./EditorEntradaModal.vue'));

const abrirEditor = () => {
    dialog.open(dynamicComponent, {});
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