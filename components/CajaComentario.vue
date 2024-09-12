<template>
    <ClientOnly fallback-tag="div" fallback="cargando editor">
        <div>
            <!-- Editor -->
            <div class="comment-input relative border border-surface-0 border-solid p-2" :class="{'border-surface-200' : mostrarExtras}">
                <div v-if="!userEdited" class="absolute left-8 top-5 text-sm text-surface-300">Comentar</div>
                <QuillEditor v-model:content="miComentario" content-type="html" :toolbar="editorToolbar" theme="bubble" @ready="onEditorReady" @focus="focused" @blur="blured"/>
            </div>
            <div class="text-right mt-2" :style="{ visibility: userEdited ? 'visible' : 'hidden' }">
                <Button  @click="Publicar" :loading="uploading" size="small">Comentar</Button>
            </div>
        </div>
    </ClientOnly>
</template>

<script setup>
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.bubble.css';
const toast = useToast();
import { useToast } from "primevue/usetoast";

const miComentario = ref('')
const mostrarExtras = ref(false)
const uploading = ref(false)
const isEditing = ref(false);
const attachedImages = ref([])

const props = defineProps({
    entradaId: { type: String, required: true},
    commentEdit: { type: Object, default: null } // If provided, we're in edit mode
})

const editorToolbar = [
	['bold', 'italic', 'underline', 'strike'],
	['blockquote', 'code-block'],
	['link', 'image', 'video'],
	['clean']
]
// const editorModules = [
// 	{
// 		module: ImageDrop,
// 		name: 'image-drop',
// 	}
// ]

const focused = () => {
    mostrarExtras.value = true
}
const blured = () => {
    mostrarExtras.value = false
}
const userEdited = computed(() => {
    return miComentario.value !== ''
})

const onEditorReady = () => {
    console.log('Editor ready')
}

const Publicar = async () => {
    console.log('Publicar', props.entradaId, miComentario.value)
    let method ='POST'
	let data = {
        entrada: props.entradaId,
		contenido: miComentario.value, 
		imagenes: attachedImages.value,
	}
	// console.log("DATA", data)	
	let endpoint = '/api/comentarios'
	if(isEditing.value){
		method = 'PATCH';
		endpoint = `/api/comentarios/${props.commentEdit.comentario.id}`
	}
	try{
		const response = await useApi(endpoint, data, method);
		console.log("Comentario creadp:", response)
		useNuxtApp().callHook("comentario:creado", {resultado:"ok"})
        toast.add({ severity: 'contrast', detail: 'Comentario publicado', life: 3000});   
	}catch{
		useNuxtApp().callHook("comentario:creado", {resultado:"error"})
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo publicar el comentario', life: 3000});
	}
	uploading.value = false;
}
</script>