<template>
    <ClientOnly>
        <div class="h-full w-full flex flex-col container-small justify-between">
            <div class="flex flex-col flex-grow max-h-[calc(100vh-11rem)] md:max-h-[calc(100vh-5rem)] relative">
                <EditorRichText ref="editor" :editingData="props.entryEdit" @publishHotKey="Publicar"
                    class="min-h-[120px] overflow-auto" />
                    
                <div v-if="auth.data.value.user.opciones?.mostrarContadorPalabras"
                    class="group wordcounter absolute bottom-0 right-4 text-right bg-white/75 text-xs text-[.7rem] p-1 rounded-bl-lg opacity-0 transition-opacity duration-300"
                    :class="{ 'opacity-100': wordCount > 0 }">
                    <div>
                        <span class="text-zinc-300">Palabras </span>
                        <span class="text-zinc-500">{{ wordCount }} </span>
                    </div>
                    <div>
                        <span class="text-zinc-300">Caracteres </span>
                        <span class="text-zinc-500">{{ characterCount }} </span>
                    </div>
                </div>
            </div>

            <!-- Opciones de Entrada (autoria, boton, adjuntos) -->
            <div v-if="paginaActual.slug == 'el-salon'" class="my-2 w-6 h-6 text-center m-auto" tabindex="1" v-tooltip.top.focus="'Lo que publiques en este espacio será visible para todxs lxs usuarixs de la plataforma. Si preferís compartir algo con un grupo más reducido, también podés publicar en los espacios de materias o bitácoras.'">
                <i class="pi pi-question-circle text-zinc-600 hover:text-zinc-900"></i>
            </div>

            <div class="flex justify-end mt-2 md:space-y-0 h-10 overflow-hidden">
                <!-- Selector Identidad -->
                <SelectorIdentidad v-model="autorSeleccionado" :disabled="uploading" class="w-10 h-10 flex-grow" />
                <!-- Boton Publicar -->
                <Button @click="Publicar"
                    class="w-full md:w-auto flex-grow md:flex-grow-0 text-xs md:text-sm btn-publicar"
                    :loading="uploading" md:fluid :label="isEditing ? 'Guardar' : publicarLabel"
                    iconPos="right"></Button>
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

const wordCount = computed(() => editor.value?.wordCount)
const characterCount = computed(() => editor.value?.characterCount)

if (props.entryEdit) {
    console.log("Editando entrada", props.entryEdit)
    if (props.entryEdit.entrada.autoriaGrupal) {
        await salonStore.FetchGruposDelUsuario();
        autorSeleccionado.value = salonStore.gruposDelUsuario.find(grupo => grupo.id == props.entryEdit.entrada.grupo.id)
        console.log("Autor seleccionado", autorSeleccionado.value)
    }
    isEditing.value = true
}

const publicarLabelContexto = ref("")
if (salonStore.currContext == "bitacora") {
    publicarLabelContexto.value = "Publicar en bitácora"
} else if (salonStore.currContext == "grupo") {
    publicarLabelContexto.value = "Publicar en bitácora grupal"
} else {
    publicarLabelContexto.value = `Publicar en ${paginaActual.value.nombre}`
}
const publicarLabel = ref(publicarLabelContexto.value)

watch(() => autorSeleccionado.value, () => {
    publicarLabel.value = `${publicarLabelContexto.value} como ${autorSeleccionado.value.nombre}`
})

const mixpanel = useMixpanel()
const toast = useToast()

const Publicar = async () => {
    if (editor.value.EditorIsEmpty()) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'La entrada está vacía', life: 3000 });
        return
    }
    uploading.value = true
    const { html, imagenes, archivos, mencionados, etiquetas, embedsYoutube, embedsVimeo } = await editor.value.parseEditorToUpload(publicarLabel)
    if (html == "") {
        return;
    }

    const { paginaActual } = useSalon() // TODO ordenar estos dos que quedaron redundantes
    let sala, salaNombre;
    if (salonStore.currContext == "bitacora" || salonStore.currContext == "grupo") {
        sala = null
        salaNombre = salonStore.currContext == "bitacora" ? "Bitácora" : "Bitácora grupal"
    } else {
        sala = paginaActual.value.id
        salaNombre = paginaActual.value.nombre
    }

    console.log({ paginaActual })
    console.log("Publicando en sala id", sala)

    let method = 'POST'
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
    if (isEditing.value) {
        method = 'PATCH';
        endpoint = `/api/entradas/${props.entryEdit.entrada.id}`
    }
    // Autoria grupal
    if (autorSeleccionado.value.id != auth.data.value.user.id) {
        body.autoriaGrupal = true
        body.grupo = autorSeleccionado.value.id
    }
    try {
        const response = await useAPI(endpoint, { body, method });
        console.log("Publicacion creada:", response)
        const cantVideos = response.doc.embedsYoutube.length + response.doc.embedsVimeo.length
        if (isEditing.value) {
            useNuxtApp().callHook("publicacion:editada", { resultado: "ok", entrada: response.doc })
            // cantidad videos
            mixpanel.track("Entrada editada", { id: response.doc.id, sala: salaNombre, imagenes: response.doc.imagenes.length, archivos: response.doc.archivos.length, videos: cantVideos, menciones: response.doc.mencionados.length, autoriaGrupal: response.doc.autoriaGrupal })
        } else {
            useNuxtApp().callHook("publicacion:creada", { resultado: "ok", entrada: response.doc })
            mixpanel.track("Entrada creada", { id: response.doc.id, sala: salaNombre, imagenes: response.doc.imagenes.length, archivos: response.doc.archivos.length, videos: cantVideos, menciones: response.doc.mencionados.length, autoriaGrupal: response.doc.autoriaGrupal })
        }

    } catch (e) {
        console.warn("Error posteando entrada", e)
        publicarLabel.value = `${publicarLabelContexto.value} como ${autorSeleccionado.value.nombre}`
        if (isEditing.value) {
            useNuxtApp().callHook("publicacion:editada", { resultado: "error" })
        } else {
            useNuxtApp().callHook("publicacion:creada", { resultado: "error" })
        }
    } finally {
        uploading.value = false;
    }
}


</script>
