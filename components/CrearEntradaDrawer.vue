<template>
    <ClientOnly>
        <div class="grow h-full flex flex-col">
            <EditorRichText ref="editor" :editingData="props.entryEdit" @publishHotKey="Publicar"/>
             
            <!-- Opciones de Entrada (autoria, boton, adjuntos) -->
            <div class="flex justify-end mt-4 flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-1">
                <SelectorIdentidad v-model="autorSeleccionado" />

                <!-- Boton Publicar -->
                <Button @click="Publicar" :loading="uploading" :label="isEditing ? 'Guardar' : publicarLabel"></Button>
            </div>
        </div>
    </ClientOnly>
</template>

<script setup>
const {data: authData} = useAuth()
const editor = ref(null)
const isEditing = ref(false)
const uploading = ref(false)
const {currContext, contextoId, gruposDelUsuario} = useSalonStore()
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
const publicarLabel = ref("Publicar *")
const sala = currContext == "bitacora" ? "Bitácora" : paginaActual.value.nombre
publicarLabel.value = sala ? `Publicar en ${sala}` : "Publicar";

	

	

if (props.entryEdit) {
    console.log("Editando entrada", props.entryEdit)
    if(props.entryEdit.entrada.autoriaGrupal){
        autorSeleccionado.value = useSalonStore().gruposDelUsuario.find(grupo => grupo.id == props.entryEdit.entrada.grupo.id)
        console.log("Autor seleccionado", autorSeleccionado.value)
    }
    isEditing.value = true
}


if(currContext == "bitacora"){
    publicarLabel.value = "Publicar en bitácora"
}else if(currContext == "grupo"){
    publicarLabel.value = "Publicar en bitácora grupal"
}




const Publicar = async () => {
    uploading.value = true
    const {html, imagenes, archivos, mencionados, etiquetas, embedsYoutube, embedsVimeo} = await editor.value.parseEditorToUpload()
    if(html == ""){
        return;
    }
    
    const {currContext} = useSalonStore()
    const { paginaActual } = useSalon() // TODO ordenar estos dos que quedaron redundantes
    const sala = currContext == "bitacora" ? null : paginaActual.value.id

    console.log({paginaActual})
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
	if(autorSeleccionado.value.id != authData.value.user.id){
		body.autoriaGrupal = true
		body.grupo = autorSeleccionado.value.id
	}
	try{
		const response = await useAPI(endpoint, {body, method});
		console.log("Publicacion creada:", response)
        if(isEditing.value){
            useNuxtApp().callHook("publicacion:editada", {resultado:"ok", entrada: response.doc})
        }else{
            useNuxtApp().callHook("publicacion:creada", {resultado:"ok", entrada: response.doc})
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
