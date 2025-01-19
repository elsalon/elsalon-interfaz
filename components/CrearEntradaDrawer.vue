<template>
    <ClientOnly>
        <div class="grow h-full flex flex-col">
            <EditorRichText ref="editor" :editingData="props.entryEdit" @publishHotKey="Publicar"/>
             
            <!-- Opciones de Entrada (autoria, boton, adjuntos) -->
            <div class="flex justify-end mt-4 flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-1">
                <Select v-model="autorSeleccionado" :options="autoresOpciones" optionLabel="name" placeholder="Autoría" class="w-full md:w-56" :disabled="disableSelectorIdentidad" >
                    <template #value="slotProps">
                        <!-- Seleccionado -->
                        <div v-if="slotProps.value" class="flex items-center">
                            <template v-if="slotProps.value.avatar">
                                <img v-if="slotProps.value.avatar" :alt="slotProps.value.label" :src="slotProps.value.avatar" :class="`mr-2`" style="width: 18px" />
                            </template>
                            <template v-else>
                                <AvatarSalon :usuario="slotProps.value" class="w-5 h-5 mr-2 text-xs" />
                            </template>
                            <div class="flex-grow">{{ slotProps.value.nombre }}</div>
                        </div>
                        <span v-else>
                            {{ slotProps.placeholder }}
                        </span>
                    </template>
                    <template #option="slotProps">
                        <!-- Lista opciones -->
                        <div class="flex items-center">
                            <template v-if="slotProps.option.avatar">
                                <img v-if="slotProps.option.avatar !=null" :alt="slotProps.option.label" :src="slotProps.option.avatar" class="mr-2" style="width: 18px" />
                            </template>
                            <template v-else>
                                <AvatarSalon :usuario="slotProps.option" class="w-5 h-5 mr-2 text-xs" />
                            </template>
                            <div class="flex-grow">{{ slotProps.option.nombre }}</div>
                        </div>
                    </template>
                    <template #footer>
                        <NuxtLink to="/opciones/grupos" target="_blank" v-if="gruposDelUsuario.length == 0">
                            <div class="px-3 py-1 text-gray-400 hover:underline text-sm">Aprendé cómo publicar como grupo</div>
                        </NuxtLink>
                    </template>
                </Select>

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
const {currContext, contextoId} = useSalonStore()
const { paginaActual } = useSalon()
const props = defineProps(
    {
        entryEdit: {
            type: Object,
            default: null
        }
    }
)
const autorSeleccionado = ref(null)
const autoresOpciones = ref([])
const {docs:gruposDelUsuario} = await useAPI(`/api/grupos?where[integrantes][contains]=${authData.value?.user?.id}`);
const disableSelectorIdentidad = ref(false)
const publicarLabel = ref("Publicar *")
const sala = currContext == "bitacora" ? "Bitácora" : paginaActual.value.nombre
publicarLabel.value = sala ? `Publicar en ${sala}` : "Publicar";

// console.log({currContext})

autoresOpciones.value.push({
		avatar: authData.value.user.avatar ? authData.value.user.avatar.sizes.thumbnail.url : null,
		nombre: authData.value?.user?.nombre, 
		id: authData.value?.user?.id 
	});
	gruposDelUsuario.forEach(grupo => {
		autoresOpciones.value.push({ 
			avatar: grupo.avatar ? grupo.avatar.sizes.thumbnail.url : null,
			nombre: grupo.nombre,
			id: grupo.id
		});
	});

	if(!autorSeleccionado.value && autoresOpciones.value.length > 0){
		autorSeleccionado.value = autoresOpciones.value[0];
	}

    if (props.entryEdit) {
        console.log("Editando entrada", props.entryEdit)
        if(props.entryEdit.entrada.autoriaGrupal){
            autorSeleccionado.value = autoresOpciones.value.find(grupo => grupo.id == props.entryEdit.entrada.grupo.id)
            console.log("Autor seleccionado", autorSeleccionado.value)
        }
        isEditing.value = true
    }



if(currContext == "bitacora"){
    autorSeleccionado.value = autoresOpciones.value.find(autor => autor.id == authData.value.user.id)
    disableSelectorIdentidad.value = true
    publicarLabel.value = "Publicar en bitácora"
}else if(currContext == "grupo"){
    autorSeleccionado.value = autoresOpciones.value.find(autor => autor.id == contextoId)
    disableSelectorIdentidad.value = true
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

// onMounted(() => {
    
// })

</script>
