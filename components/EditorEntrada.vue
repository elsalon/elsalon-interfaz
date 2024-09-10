<template>
    <Button id="btnEscribir" label="+ Escribir" @click="visible = true" />

    <Drawer v-model:visible="visible" header="Escribir" position="full">
        <EditorEntradaQuill/>
    </Drawer>
</template>

<script setup>
import { ref } from "vue";
import EditorEntradaQuill from "./EditorEntradaQuill.vue";
const toast = useToast();
import { useToast } from "primevue/usetoast";
const visible = ref(false);


onMounted(() => {
    useNuxtApp().hooks.hook('publicacion:creada', (data) => {
        if(data.resultado == "ok"){
            // Publicacion exitosa. Cierro el dialogo y muestro un toast
            visible.value = false;
            toast.add({ severity: 'contrast', detail: 'Entrada publicada', life: 3000});   
        }else{
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo publicar la entrada', life: 3000});
        }
    });
});

</script>
<style scoped lang="scss">
#btnEscribir{
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
}
</style>