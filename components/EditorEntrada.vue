<template>
    <Button id="btnEscribir" label="+ Escribir" @click="visible = true" />

    <Dialog class="dialog-quill-editor" header=" " v-model:visible="visible" modal maximizable :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <EditorEntradaQuill/>
    </Dialog>
</template>

<script setup>
import { ref } from "vue";
import EditorEntradaQuill from "./EditorEntradaQuill.vue";

const visible = ref(false);

</script>
<style scoped lang="scss">
#btnEscribir{
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
}
</style>