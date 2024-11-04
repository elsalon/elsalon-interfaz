<template>
    <ClientOnly fallback-tag="div" fallback="cargando editor">
        <div>
            <!-- Editor -->
            <div class="comment-input">
                <EditorRichText ref="editor" :editingData="props.commentEdit" @publishHotKey="Publicar"/>
                <!-- <QuillEditor placeholder="Comentario" v-model:content="miComentario" content-type="html" :toolbar="editorToolbar" theme="bubble" @focus="focused" @blur="blured"/> -->
            </div>
            <div class="text-right mt-2">
                <Button  @click="Publicar" :loading="uploading" size="small" :label="isEditing ? 'Guardar' : 'Comentar'"></Button>
            </div>
        </div>
    </ClientOnly>
</template>

<script setup>
const toast = useToast();

const editor = ref(null)
const miComentario = ref('')
// const mostrarExtras = ref(false)
const uploading = ref(false)
const isEditing = ref(false);


const props = defineProps({
    entradaId: { type: String},
    commentEdit: { type: Object, default: null } // If provided, we're in edit mode
})

const emit = defineEmits(['userPosted'])

const userEdited = computed(() => {
    return miComentario.value !== ''
})

const ClearEditor = () => {
    editor.value.clear()
}

const Publicar = async () => {
    uploading.value = true
    const {html, imagenes, archivos, mencionados, etiquetas} = await editor.value.parseEditorToUpload()
    if(html == ""){
        return;
    }
    // console.log('Publicar', props.entradaId, miComentario.value)
    let method ='POST'
	let body = {
        entrada: props.entradaId,
		contenido: html, 
		imagenes,
        archivos,
        mencionados,
        etiquetas,
	}
	// console.log("DATA", data)	
	let endpoint = '/api/comentarios'
	if(isEditing.value){
		method = 'PATCH';
		endpoint = `/api/comentarios/${props.commentEdit.entrada.id}`
	}
	try{
		const response = await useAPI(endpoint, {body, method});
		console.log("Comentario creado:", response)
		useNuxtApp().callHook("comentario:creado", {resultado:"ok"})
        toast.add({ severity: 'contrast', detail: 'Comentario publicado', life: 3000});   
        emit('userPosted', response.doc)
        
	}catch{
		useNuxtApp().callHook("comentario:creado", {resultado:"error"})
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo publicar el comentario', life: 3000});
	}
	uploading.value = false;
}

const handleHotkey = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        console.log("Hotkey Publicar comentario")
        Publicar();
    }
}

onMounted(() => {
    if (props.commentEdit) {
        isEditing.value = true
    }
})

defineExpose({ClearEditor})


</script>