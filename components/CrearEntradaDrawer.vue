<template>
    <ClientOnly>
        <div class="h-full w-full flex flex-col container-medium justify-between">
            <div class="flex flex-col flex-grow max-h-[calc(100vh-11rem)] md:max-h-[calc(100vh-2rem)] relative">
                <EditorRichText 
                    ref="editor" 
                    :editingData="props.entryEdit" 
                    :autosaveContext="autosaveContext"
                    :autosaveEnabled="!isEditing"
                    @publishHotKey="solicitarConfirmacionSala"
                    class="min-h-[120px] overflow-auto">
                    <template #footerBeforeAttach>
                        <div v-if="auth.data.value.user.opciones?.mostrarContadorPalabras"
                            class="group wordcounter background-transparent text-right text-xs text-[.7rem] p-1 opacity-0 transition-opacity duration-300"
                            :class="{ 'opacity-100': wordCount > 0 }" style="background: none">
                            <div>
                                <span class="text-zinc-300 dark:text-zinc-500">Palabras </span>
                                <span class="text-zinc-500 dark:text-zinc-300">{{ wordCount }} </span>
                            </div>
                            <div>
                                <span class="text-zinc-300 dark:text-zinc-500">Caracteres </span>
                                <span class="text-zinc-500 dark:text-zinc-300">{{ characterCount }} </span>
                            </div>
                        </div>
                    </template>
                </EditorRichText>
                    
            </div>

            <!-- Opciones de Entrada (autoria, boton, adjuntos) -->
            
            <div class="flex justify-end mt-2 md:space-y-0 h-10 overflow-hidden">
                
                <div v-if="paginaActual.slug == 'el-salon'" class="my-2 mx-2 w-6 h-6 text-center" tabindex="1" v-tooltip.focus="'Lo que publiques en este espacio será visible para todxs lxs usuarixs de la plataforma. Si preferís compartir algo con un grupo más reducido, también podés publicar en los espacios de materias o bitácoras.'">
                    <i class="pi pi-question-circle text-zinc-600 hover:text-zinc-900"></i>
                </div>

                <!-- Selector Identidad -->
                <SelectorIdentidad v-model="autorSeleccionado" :disabled="uploading" class="w-10 h-10" />
                <!-- Boton Publicar -->
                <Button @click="solicitarConfirmacionSala"
                    class="w-full md:w-auto flex-grow md:flex-grow-0 text-xs md:text-sm btn-publicar"
                    :loading="uploading" md:fluid :label="isEditing ? 'Guardar' : publicarLabel"
                    iconPos="right"></Button>
            </div>
        </div>

        <Dialog v-model:visible="confirmSalaVisible" modal header="Confirmar sala" :style="{ width: '26rem' }"
            :dismissableMask="true">
            <div class="space-y-3">
                <p class="text-sm text-zinc-600 dark:text-zinc-300">
                    Estás por publicar en <span class="font-semibold text-zinc-800 dark:text-white">{{ salaSeleccionadaNombre }}</span>.
                    Lo que publiques acá será visible para toda la comunidad.<br><br>
                    Si querías publicar en  <span class="font-semibold text-zinc-800 dark:text-white">una materia o en tu bitácora</span>, podés cambiar la sala antes de publicar.
                </p>

                <div class="flex flex-col gap-2">
                    <Select v-model="salaSeleccionadaId"
                        :options="salaDropdownOptions"
                        optionLabel="label"
                        optionValue="value"
                        :loading="enlacesLoading"
                        :disabled="uploading || enlacesLoading"
                        placeholder="Selecciona una sala"
                        :pt="{ dropdownIcon: { class: 'hidden' }, trigger: { class: 'pr-2' } }"
                        fluid>
                        <template #value="slotProps">
                            <div v-if="slotProps.value !== undefined" class="flex items-center gap-2">
                                <template v-if="slotProps.value === null">
                                    <AvatarSalon class="mr-2 w-8 h-8" :usuario="auth?.data.value.user"/>
                                    <span>{{ salaDropdownOptions.find(o => o.value === null)?.label }}</span>
                                </template>
                                <template v-else>
                                    <Avatar :label="salaDropdownOptions.find(o => o.value === slotProps.value)?.sigla" 
                                            :style="{ backgroundColor: salaDropdownOptions.find(o => o.value === slotProps.value)?.color || '#000', color: '#fff' }" 
                                            shape="" class="w-8 h-8 text-xs md:text-base" />
                                    <span>{{ salaDropdownOptions.find(o => o.value === slotProps.value)?.label }}</span>
                                </template>
                            </div>
                            <span v-else class="text-zinc-400">{{ slotProps.placeholder }}</span>
                        </template>
                        <template #option="slotProps">
                            <div class="flex items-center gap-2" v-if="slotProps.option">
                                <AvatarSalon v-if="slotProps.option.isBitacora" class="mr-2 w-8 h-8" :usuario="auth?.data.value.user"/>
                                <Avatar v-else :label="slotProps.option.sigla" :style="{ backgroundColor: slotProps.option.color || '#000', color: '#fff' }" shape="" class="w-8 h-8 text-xs md:text-base" />
                                <!-- <img :src="slotProps.option.image" :alt="slotProps.option.label" class="w-8 h-8 rounded" /> -->
                                <span>{{ slotProps.option.label }}</span>
                            </div>
                        </template>
                    </Select>
                </div>

                <p class="text-xs text-zinc-600 dark:text-zinc-300">
                    Si no ves la sala que buscás, asegurate de haberte enlazado primero.
                </p>

                <div class="flex justify-end gap-2 pt-2">
                    <Button type="button" label="Cancelar" severity="secondary" @click="cancelarConfirmacionSala"
                        :disabled="uploading || enlacesLoading"></Button>
                    <Button type="button" iconPos="right" label="Publicar" @click="confirmarYPublicar"
                        :loading="uploading" :disabled="enlacesLoading"></Button>
                </div>
            </div>
        </Dialog>
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
const confirmSalaVisible = ref(false)
const salaSeleccionadaId = ref(null)
const salaConfirmDefaults = ref({ sala: null, salaNombre: '' })
const enlacesLoading = ref(false)
const enlacesData = ref(null)

// Compute autosave context for new entries (context-aware)
const autosaveContext = computed(() => {
    const baseType = 'entrada'

    // Bitácora personal: use user id to avoid clashes
    if (salonStore.currContext === 'bitacora') {
        return { type: baseType, id: `bitacora:${auth.data.value.user.id}` }
    }

    // Bitácora grupal: tie to current contextoId
    if (salonStore.currContext === 'grupo') {
        return { type: baseType, id: `grupo:${salonStore.contextoId || 'sin-id'}` }
    }

    // Default: current sala/context id
    return {
        type: baseType,
        id: salonStore.contextoId || paginaActual.value?.id || 'nueva'
    }
})

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

const resolveSalaDataForPublication = () => {
    if (salonStore.currContext === 'bitacora' || salonStore.currContext === 'grupo') {
        return {
            sala: null,
            salaNombre: salonStore.currContext === 'bitacora' ? 'Bitácora' : 'Bitácora grupal',
        }
    }

    if (isEditing.value && !['bitacora', 'grupo'].includes(salonStore.currContext)) {
        return {
            sala: props.entryEdit?.entrada?.sala?.id ?? paginaActual.value?.id ?? null,
            salaNombre: props.entryEdit?.entrada?.sala?.nombre ?? paginaActual.value?.nombre ?? '',
        }
    }

    return {
        sala: paginaActual.value?.id ?? null,
        salaNombre: paginaActual.value?.nombre ?? '',
    }
}

const enlazadoIds = computed(() => {
    return enlacesData.value?.docs?.map(e => e.idEnlazado) || []
})

const salaDropdownOptions = computed(() => {
    const base = resolveSalaDataForPublication()
    const baseLabel = base.salaNombre || 'Contexto actual'

    const options = [{
        label: `${baseLabel} (actual)`,
        value: base.sala ?? null,
        sigla: base.sigla || 'S',
        color: base.color || '#000',
        isBitacora: false,
    }]

    // Add user's bitácora (id: null)
    if (base.sala !== null) {
        options.push({
            label: 'Bitácora',
            value: null,
            isBitacora: true,
        })
    }

    // Add only salas the user has enlazado
    const otherSalas = salonStore.salas
        .filter(s => s.id !== base.sala && enlazadoIds.value.includes(s.id))
        .map(s => ({ 
            label: s.nombre, 
            value: s.id,
            image: 'https://via.placeholder.com/32?text=Sala',
            sigla: s.siglas || 'S',
            color: s.color || '#000',
            isBitacora: false,
        }))

    return [...options, ...otherSalas]
})

const salaSeleccionadaNombre = computed(() => {
    if (salaSeleccionadaId.value === null && salaConfirmDefaults.value.sala === null) {
        return salaConfirmDefaults.value.salaNombre || 'el contexto actual'
    }

    if (salaSeleccionadaId.value === salaConfirmDefaults.value.sala) {
        return salaConfirmDefaults.value.salaNombre || 'el contexto actual'
    }

    const match = salonStore.salas.find(s => s.id === salaSeleccionadaId.value)
    return match?.nombre || salaConfirmDefaults.value.salaNombre || 'el contexto actual'
})

const solicitarConfirmacionSala = async () => {
    if (uploading.value) return

    if (editor.value.EditorIsEmpty()) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'La entrada está vacía', life: 3000 });
        return
    }
    
    if (!SospechaSalaIncorrecta()) {
        Publicar();
        return;
    }
    
    // Show modal immediately
    const baseSala = resolveSalaDataForPublication()
    salaConfirmDefaults.value = baseSala
    salaSeleccionadaId.value = baseSala.sala ?? null
    confirmSalaVisible.value = true

    // Fetch enlaces in background only if not already loaded
    if (!enlacesData.value) {
        try {
            enlacesLoading.value = true
            const result = await useAPI(`/api/enlaces?where[autor][equals]=${auth.data.value.user.id}`)
            enlacesData.value = result
        } catch (e) {
            console.error("Error fetching enlaces", e)
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las salas', life: 3000 });
        } finally {
            enlacesLoading.value = false
        }
    }
}

const SospechaSalaIncorrecta = () => {
    // Si no es El Salon, no hace falta confirmacion
    console.log("Curr context:", salonStore.currContext)
    if(salonStore.contextoId != salonStore.elSalonId){
        return false
    }
    // Si el usuario se creo hace mas de x año, no hace falta confirmacion
    const aniosParaConfirmacion = 1
    const fechaCreacion = new Date(auth.data.value.user.createdAt)
    const xAniosDespues = new Date(fechaCreacion)
    xAniosDespues.setFullYear(xAniosDespues.getFullYear() + aniosParaConfirmacion)
    if (new Date() > xAniosDespues) {
        return false
    }
    return true
}

const cancelarConfirmacionSala = () => {
    if (uploading.value) return
    confirmSalaVisible.value = false
}

const confirmarYPublicar = async () => {
    confirmSalaVisible.value = false
    await Publicar(salaSeleccionadaId.value)
}

const Publicar = async (salaOverrideId = undefined) => {
    if (editor.value.EditorIsEmpty()) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'La entrada está vacía', life: 3000 });
        return
    }
    uploading.value = true
    const { html, imagenes, archivos, mencionados, etiquetas, embedsYoutube, embedsVimeo } = await editor.value.parseEditorToUpload(publicarLabel)
    if (html == "") {
        uploading.value = false
        return;
    }

    const baseSalaData = resolveSalaDataForPublication()
    let salaData = baseSalaData

    if (salaOverrideId !== undefined) {
        const match = salonStore.salas.find(s => s.id === salaOverrideId)
        salaData = {
            sala: salaOverrideId,
            salaNombre: match?.nombre ?? baseSalaData.salaNombre,
        }
    }

    const { sala, salaNombre } = salaData

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
            // Clear autosave after successful publication
            editor.value?.clearAutoSave()
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
