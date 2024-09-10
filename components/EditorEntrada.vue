<template>
    <Button id="btnEscribir" label="+ Escribir" @click="AbrirEditor" />

    <Drawer v-model:visible="visible" header="Escribir" position="full">
        <EditorEntradaQuill :postEdit="editContent"/>
    </Drawer>
</template>

<script setup>
import { ref } from "vue";
import EditorEntradaQuill from "./EditorEntradaQuill.vue";
const toast = useToast();
import { useToast } from "primevue/usetoast";
const visible = ref(false);
const editContent = ref(null);

const AbrirEditor = () => {
    editContent.value = null;
    visible.value = true;
}

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

    useNuxtApp().hooks.hook('publicacion:editar', (data) => {
		visible.value = true;
        editContent.value = data;
	})
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