<template>
    <ClientOnly fallback-tag="div" fallback="cargando editor">
        <div>
            <!-- Editor -->
            <div class="comment-input">
                <EditorRichText ref="editor" :editingData="props.commentEdit" @publishHotKey="Publicar"/>
                <!-- <QuillEditor placeholder="Comentario" v-model:content="miComentario" content-type="html" :toolbar="editorToolbar" theme="bubble" @focus="focused" @blur="blured"/> -->
            </div>
            <div class="text-right mt-2 flex justify-end  space-y-1 flex-row md:space-y-0 md:space-x-1">
                <!-- Btn Cancelar -->
                <Button text @click="CancelComment" class="mr-auto " size="small" label="Cancelar" />
                <!-- Selector Identidad -->
                <SelectorIdentidad v-model="autorSeleccionado" :esComentario="true" class="w-1/3 md:w-auto"/>
                <!-- Btn Publica -->
                <Button  @click="Publicar" :loading="uploading" size="small" :label="isEditing ? 'Guardar' : 'Comentar'" class="w-2/3 md:w-auto"></Button>
            </div>
        </div>
    </ClientOnly>
</template>

<script setup>
const {data: authData} = useAuth()
const salonStore = useSalonStore()
const toast = useToast();

const editor = ref(null)
const miComentario = ref('')
const uploading = ref(false)
const isEditing = ref(false);

const autorSeleccionado = ref(null)

const props = defineProps({
    entradaId: { type: String},
    commentEdit: { type: Object, default: null } // If provided, we're in edit mode
})

const emit = defineEmits(['userPosted', 'cancelComment'])

const userEdited = computed(() => {
    return miComentario.value !== ''
})
const CancelComment = () => {
    miComentario.value = ''
    emit('cancelComment')
}

const ClearEditor = () => {
    editor.value.clear()
}

const mixpanel = useMixpanel()

const Publicar = async () => {
    uploading.value = true
    const {html, imagenes, archivos, mencionados, etiquetas, embedsYoutube, embedsVimeo} = await editor.value.parseEditorToUpload()
    if(html == ""){
        return;
    }
    // console.log('Publicar', props.entradaId, miComentario.value)
    let method ='POST'
	let body = {
        entrada: props.entradaId,
		contenido: html, 
        autoriaGrupal: false,
		imagenes,
        archivos,
        mencionados,
        etiquetas,
        embedsYoutube, 
        embedsVimeo,
	}
	// console.log("DATA", data)	
	let endpoint = '/api/comentarios'
	if(isEditing.value){
		method = 'PATCH';
		endpoint = `/api/comentarios/${props.commentEdit.entrada.id}`
	}
    // Autoria grupal
	if(autorSeleccionado.value.id != authData.value.user.id){
		body.autoriaGrupal = true
		body.grupo = autorSeleccionado.value.id
	}
	try{
		const response = await useAPI(endpoint, {body, method});
		console.log("Comentario creado:", response)
		useNuxtApp().callHook("comentario:creado", {resultado:"ok"})
        console.log("emit userPosted", response.doc)
        emit('userPosted', response.doc)
        if(isEditing.value){
            toast.add({ severity: 'contrast', detail: 'Comentario editado', life: 3000});
            mixpanel.track("Comentario editado", {id: response.doc.id, entrada: props.entradaId})
        }else{
            toast.add({ severity: 'contrast', detail: 'Comentario publicado', life: 3000});
            mixpanel.track("Comentario creado", {id: response.doc.id, entrada: props.entradaId})
        }
        
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

onMounted(async() => {
    if (props.commentEdit) {
        isEditing.value = true

        if(props.commentEdit.entrada.autoriaGrupal){
            await salonStore.FetchGruposDelUsuario();
            autorSeleccionado.value = salonStore.gruposDelUsuario.find(grupo => grupo.id == props.commentEdit.entrada.grupo.id)
            console.log("Autor seleccionado", autorSeleccionado.value)
        }
    }
})

defineExpose({ClearEditor})


</script>