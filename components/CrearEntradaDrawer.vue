<template>
    <ClientOnly>
        <div class="grow h-full flex flex-col">
            <EditorRichText ref="editor" :editingData="props.entryEdit" @publishHotKey="Publicar"/>
             
            <!-- Opciones de Entrada (autoria, boton, adjuntos) -->
            <div class="flex justify-end mt-4 md:space-y-0 ">
                <!-- Selector Identidad -->
                <SelectorIdentidad v-model="autorSeleccionado" :disabled="uploading"/>
                <!-- Boton Publicar -->
                <Button @click="Publicar" class="flex-grow md:flex-grow-0" :loading="uploading" :label="isEditing ? 'Guardar' : publicarLabel"></Button>
            </div>
        </div>
    </ClientOnly>
</template>

<script setup>
const auth = useAuth()
const editor = ref(null)
const isEditing = ref(false)
const uploading = ref(false)
const salonStore = useSalonStore()
const { paginaActual } = useSalon()
const props = defineProps(
    {
        entryEdit: {
            type: Object,
            default: null
        }
    },
)
const autorSeleccionado = ref(null)
const sala = salonStore.currContext == "bitacora" ? "Bitácora" : paginaActual.value.nombre

if (props.entryEdit) {
    console.log("Editando entrada", props.entryEdit)
    if(props.entryEdit.entrada.autoriaGrupal){
        await salonStore.FetchGruposDelUsuario();
        autorSeleccionado.value = salonStore.gruposDelUsuario.find(grupo => grupo.id == props.entryEdit.entrada.grupo.id)
        console.log("Autor seleccionado", autorSeleccionado.value)
    }
    isEditing.value = true
}


const publicarLabelContexto = ref("")
publicarLabelContexto.value = sala ? `Publicar en ${sala}` : "Publicar";
if(salonStore.currContext == "bitacora"){
    publicarLabelContexto.value = "Publicar en bitácora"
}else if(salonStore.currContext == "grupo"){
    publicarLabelContexto.value = "Publicar en bitácora grupal"
}
const publicarLabel = ref(publicarLabelContexto.value)

watch(() => autorSeleccionado.value, () => {
    publicarLabel.value = `${publicarLabelContexto.value} como ${autorSeleccionado.value.nombre}`
})

const mixpanel = useMixpanel()

const Publicar = async () => {
    uploading.value = true
    const {html, imagenes, archivos, mencionados, etiquetas, embedsYoutube, embedsVimeo} = await editor.value.parseEditorToUpload(publicarLabel)
    if(html == ""){
        return;
    }
    
    const { paginaActual } = useSalon() // TODO ordenar estos dos que quedaron redundantes
    const sala = salonStore.currContext == "bitacora" ? null : paginaActual.value.id
    const salaNombre = salonStore.currContext == "bitacora" ? "Bitácora" : paginaActual.value.nombre

    console.log({paginaActual})
    console.log("Publicando en sala id", sala)
    
    let method ='POST'
	let body = {
		contenido: html, 
		sala,
		autoriaGrupal: false,
		imagenes,
        archivos,
        mencionados,
        etiquetas,
        embedsYoutube, 
        embedsVimeo,
	}
	// console.log("body", html, imagenes)	
	let endpoint = '/api/entradas'
	if(isEditing.value){
		method = 'PATCH';
		endpoint = `/api/entradas/${props.entryEdit.entrada.id}`
	}
	// Autoria grupal
	if(autorSeleccionado.value.id != auth.data.value.user.id){
		body.autoriaGrupal = true
		body.grupo = autorSeleccionado.value.id
	}
	try{
		const response = await useAPI(endpoint, {body, method});
		console.log("Publicacion creada:", response)
        const cantVideos = response.doc.embedsYoutube.split(",").length + response.doc.embedsVimeo.split(",").length
        if(isEditing.value){
            useNuxtApp().callHook("publicacion:editada", {resultado:"ok", entrada: response.doc})
            // cantidad videos
            mixpanel.track("Entrada editada", {id: response.doc.id, sala: salaNombre, imagenes: response.doc.imagenes.length, archivos: response.doc.archivos.length, videos: cantVideos, menciones: response.doc.mencionados.length, autoriaGrupal: response.doc.autoriaGrupal})
        }else{
            useNuxtApp().callHook("publicacion:creada", {resultado:"ok", entrada: response.doc})
            mixpanel.track("Entrada creada", {id: response.doc.id, sala: salaNombre, imagenes: response.doc.imagenes.length, archivos: response.doc.archivos.length, videos: cantVideos, menciones: response.doc.mencionados.length, autoriaGrupal: response.doc.autoriaGrupal})
        }
        
	}catch{
        if(isEditing.value){
            useNuxtApp().callHook("publicacion:editada", {resultado:"error"})
        }else{
		    useNuxtApp().callHook("publicacion:creada", {resultado:"error"})
        }
	}
    uploading.value = false;
}


</script>
