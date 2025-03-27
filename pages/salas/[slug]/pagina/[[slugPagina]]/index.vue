<script setup>

const route = useRoute()
const salonStore = useSalonStore();
const toast = useToast();
const mixpanel = useMixpanel()

const slugPagina = route.params?.slugPagina
const slug = route.params?.slug
const salon = ref(null)
salon.value = salonStore.salas.find(salon => salon.slug === slug)

const queryCacheKey = "pagina" + slugPagina;
const { data } = await useAsyncData(queryCacheKey, () => useAPI(`/api/secciones?where[slug][equals]=${slugPagina}`))
const pagina = ref(data.value.docs[0])

// Editar
const isEditing = ref(false)
const uploading = ref(false)
const paginaEdit = ref(null)
const contenidoRender = ref()
const editor = ref()
const buttonLabel = ref("Guardar")

const Editar = () => {
    paginaEdit.value = { entrada: pagina.value.componente[0], html: contenidoRender.value.contenidoRendereado }
    isEditing.value = true
}

const Publicar = async () => {
    if(editor.value.EditorIsEmpty()){
        toast.add({ severity: 'error', summary: 'Error', detail: 'La página está vacía', life: 3000});
        return
    }
    uploading.value = true
    const {html, imagenes, archivos, mencionados, etiquetas, embedsYoutube, embedsVimeo} = await editor.value.parseEditorToUpload(buttonLabel)
    if(html == ""){
        return;
    }
    // console.log('Publicar', props.entradaId, miComentario.value)
    let method ='PATCH'
    let endpoint = `/api/secciones/${pagina.value.id}`
	
    let blockComponent = {
        blockType: 'pagina',
		contenido: html,
        autoriaGrupal: false,
		imagenes,
        archivos,
        mencionados,
        etiquetas,
        embedsYoutube, 
        embedsVimeo,
	}
    
    pagina.value.autor = typeof(pagina.value.autor) == 'object' ? pagina.value.autor.id : pagina.value.autor;
    pagina.value.sala = typeof(pagina.value.sala) == 'object' ? pagina.value.sala.id : pagina.value.sala;
    pagina.value.componente[0] = blockComponent
 
	try{
		const response = await useAPI(endpoint, {body:pagina.value, method});
		console.log("Pagina editada:", response)
        toast.add({ severity: 'contrast', detail: 'Pagina editada', life: 3000});
        mixpanel.track("Pagina editada", {id: response.doc.id, entrada: response.doc.nombre})
		pagina.value = response.doc
        
	}catch(e){
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo publicar el comentario', life: 3000});
        console.error(e)
	}finally{
        uploading.value = false;
        isEditing.value = false
    }
}


</script>

<template>
    <NuxtLayout name="layout-contenido">
        <template #header>
            <RouterLink :to="`/`" class="link">S</RouterLink> /
            <NuxtLink :to="`/salas/${salon.slug}`" class="link">{{ salon.siglas }}</NuxtLink> /
            {{ pagina.nombre }}
        </template>

        <div class="text-center mb-2">
            <LogoSala :salon="salon"/>
            <NuxtLink class="text-3xl font-bold" :to="`/salas/${salon.slug}`"><h1>{{ salon.nombre }}</h1></NuxtLink>
        </div>
        
        <div class="entrada-default-container mt-10">
            <div v-if="isEditing">
                <EditorRichText ref="editor" :editingData="paginaEdit" @publishHotKey="Publicar"/>
                <div class="text-right mt-4">
                    <Button type="button" iconPos="right" :loading="uploading" :label="isEditing ? 'Guardar' : buttonLabel" @click="Publicar"/>
                </div>
            </div>
            <div v-else>
                <template v-if="!pagina.componente[0].contenido">
                    <div class="text-center h-40 mt-10 flex flex-col justify-center items-center">
                        <!-- CTA Sin contenido -->
                        <p class="font-bold">Página vacía</p>
                        <p class="text-zinc-600">Editá para crear contenido</p>
                        <Button type="button" label="Editar" class="mt-4" @click="Editar"/>
                    </div>
                </template>
                
                <ContenidoRendereado ref="contenidoRender" :contenido="pagina.componente[0]" :id="pagina.updatedAt"/>
                <div class="text-right mt-4" v-if="pagina.componente[0].contenido">
                    <Button type="button" label="Editar" @click="Editar" text/>
                </div>
                
            </div>

            <div class="h-10"></div>
        </div>


    </NuxtLayout>
</template>
