<template>
    <ClientOnly>
        <div class="grow h-full flex flex-col">
            <EditorRichText ref="editor" :editingData="props.entryEdit" @publishHotKey="Publicar"/>
             
            <!-- Opciones de Entrada (autoria, boton, adjuntos) -->
            <div class="flex justify-end mt-4 flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-1">
                <Select v-model="autorSeleccionado"  :options="autoresOpciones" optionLabel="name" placeholder="Autoría" class="w-full md:w-56" >
                    <template #value="slotProps">
                        <!-- Seleccionado -->
                        <div v-if="slotProps.value" class="flex items-center">
                            <template v-if="slotProps.value.avatar">
                                <img v-if="slotProps.value.avatar" :alt="slotProps.value.label" :src="slotProps.value.avatar" :class="`mr-2`" style="width: 18px" />
                            </template>
                            <template v-else>
                                <div class="w-6 h-6"></div>
                            </template>
                            <div class="flex-grow">{{ slotProps.value.name }}</div>
                        </div>
                        <span v-else>
                            {{ slotProps.placeholder }}
                        </span>
                    </template>
                    <template #option="slotProps">
                        <!-- Lista opciones -->
                        <div class="flex items-center">
                            <template v-if="slotProps.option.avatar">
                                <img v-if="slotProps.option.avatar !=null" :alt="slotProps.option.label" :src="slotProps.option.avatar" :class="`mr-2`" style="width: 18px" />
                            </template>
                            <template v-else>
                                <div class="w-6 h-6"></div>
                            </template>
                            <div class="flex-grow">{{ slotProps.option.name }}</div>
                        </div>
                    </template>
                </Select>

                <!-- Boton Publicar -->
                <Button @click="Publicar" :loading="uploading" :label="isEditing ? 'Guardar' : 'Publicar'"></Button>
            </div>
        </div>
    </ClientOnly>
</template>

<script setup>
const {data: authData} = useAuth()
const runtimeConfig = useRuntimeConfig().public;
const editor = ref(null)
const isEditing = ref(false)
const uploading = ref(false)
const props = defineProps(
    {
        entryEdit: {
            type: Object,
            default: null
        }
    }
)

const autorSeleccionado = ref(null)
const autoresOpciones =ref([])
const {docs:gruposDelUsuario} = await useApi(`/api/grupos?where[integrantes][contains]=${authData.value?.user?.id}`);

const Publicar = async () => {
    const {html, imagenes, archivos} = await editor.value.parseEditorToUpload()
    if(html == ""){
        return;
    }
    uploading.value = true
    const { paginaActual } = useSalon()
    
    let method ='POST'
	let data = {
		contenido: html, 
		imagenes: imagenes,
        archivos: archivos,
		sala: paginaActual.value.id,
		autoriaGrupal: false,
	}
	// console.log("DATA", html, imagenes)	
	let endpoint = '/api/entradas'
	if(isEditing.value){
		method = 'PATCH';
		endpoint = `/api/entradas/${props.entryEdit.entrada.id}`
	}
	// Autoria grupal
	if(autorSeleccionado.value.id != authData.value.user.id){
		data.autoriaGrupal = true
		data.grupo = autorSeleccionado.value.id
	}
	try{
		const response = await useApi(endpoint, data, method);
		console.log("Publicacion creada:", response)
        if(isEditing.value){
            useNuxtApp().callHook("publicacion:editada", {resultado:"ok", entrada: response.doc})
        }else{
            useNuxtApp().callHook("publicacion:creada", {resultado:"ok"})
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

onMounted(() => {
    autoresOpciones.value.push({
		avatar: authData.value.user.avatar ? runtimeConfig.apiBase + authData.value.user.avatar.sizes.thumbnail.url : null,
		name: authData.value?.user?.nombre, 
		id: authData.value?.user?.id 
	});
	gruposDelUsuario.forEach(grupo => {
		autoresOpciones.value.push({ 
			avatar: grupo.avatar ? runtimeConfig.apiBase + grupo.avatar.sizes.thumbnail.url : null,
			name: grupo.nombre,
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
})

</script>
