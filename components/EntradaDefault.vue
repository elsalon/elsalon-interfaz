<template>
    <div class="group/entrada transition-all duration-500 ease-in-out entrada-default md:p-1"
    :class="{ 'opacity-30': loading, 'bg-orange-50': resaltar }">
    <article>
        <!-- Para ocultar nombres hasta hover: opacity-0 group-hover:opacity-100 transition-opacity  -->
        <div class="flex pb-2">
            <NuxtLink :to="identidadUrl">
                <AvatarSalon :usuario="identidad" :title="tituloIdentidad" />
            </NuxtLink>
            <!-- <EntradaDefault /> -->
            
                <!-- Metadata entrada -->
                <div class="ml-4">
                    <NuxtLink :to="identidadUrl" class="hover:underline">
                        <h2 class="font-bold text-gray-700" :title="tituloIdentidad">{{ identidad.nombre }}</h2>
                    </NuxtLink>
                    <div class="flex items-center">
                        <NuxtLink v-if="entrada.sala" class="text-sm mr-2 hover:underline"
                            :to="`/salones/${entrada.sala.slug}`">{{ entrada.sala.nombre }}</NuxtLink>
                        <NuxtLink v-else="identidadUrl" class="text-sm mr-2 hover:underline" :to="identidadUrl">Bitácora
                        </NuxtLink>
                        <NuxtLink class="text-gray-400 text-sm hover:underline" :to="`/entradas/${entrada.id}`">
                            <time :datetime="entrada.createdAt" class="text-gray-400 text-xs">{{ $formatDate(entrada.createdAt) }}</time>
                        </NuxtLink>
                        <!-- Entrada Fijada -->
                        <i v-if="entrada.fijada" class="pi pi-thumbtack text-gray-400 ml-2" style="font-size: .65rem"
                            title="Entrada Fijada"></i>
                        <!-- Entrada Destacada -->
                        <i v-if="entrada.destacada" class="pi pi-star text-gray-400 ml-2" style="font-size: .7rem"
                            title="Entrada Destacada"></i>
                    </div>
                </div>

                <!-- Menú ajustes entrada -->
                <div class="flex-grow md:invisible group-hover/entrada:visible text-right">
                    <Button text @click="ToggleArticleOptions">...</Button>
                    <Menu v-if="opcionesArticulo.length>0" :ref="el => menuRefs[entrada.id] = el" id="overlay_menu_article" :model="opcionesArticulo"
                        :popup="true" class="text-xs" />
                </div>
            </div>
            <div
                class="prose prose-headings:text-xl prose-headings:my-1 leading-normal prose-img:my-2 break-words max-w-none">
                <ContenidoRendereado ref="contenidoRender" :contenido="entrada" />
            </div>
            <div class="" v-if="entrada.archivos.length">
                <ListaArchivos :archivos="entrada.archivos" />
            </div>
        </article>
        <div class="despues-entrada ml-0">
            <!-- <Divider /> -->
            <!-- Comentarios -->
            <div class="actions">
                <!-- Boton Comentar. Solo se muestra si no tiene comentarios -->
                <Button v-show="!listaComentarios?.comentarios?.length > 0" link class="my-2 mr-2 text-xs text-surface-500" style="padding: 0;"
                    label="Comentar" @click="ToggleCommentBox" />
                <Aprecio :contenidoid="entrada.id" contenidotipo="entrada" :aprecioIniciales="entrada.aprecios" />

                
                <Button v-if="HabilitarPlaylist" class="ml-auto group/playlist font-mono text-xs hover:text-black" @click="AbrirPlaylist" link >
                    <span class="mr-1 opacity-0 group-hover/playlist:opacity-100 transition-opacity">Playlist</span>
                    <i class="pi pi-play-circle" />
                </Button>
            </div>
            <ListaComentarios :entradaId="entrada.id" :comentariosIniciales="entrada.comentarios"
                :showCommentBox="showCommentBox" @userPosted="UserCommented" ref="listaComentarios" />
        </div>
    </div>
</template>

<script setup>
const salonStore = useSalonStore()
const auth = useAuth()
const { $formatDate } = useNuxtApp()
const { hooks } = useNuxtApp();

const props = defineProps({
    entrada: Object,
    identidadUrl: String,
    tituloIdentidad: String,
    identidad: Object,
    archivos: Array,
    opcionesArticulo: Array,
    resaltar: Boolean,
    loading: Boolean,
    showCommentBox: Boolean,
    // Methods
    ToggleCommentBox: Function,
    ToggleArticleOptions: Function,
    EliminarEntrada: Function,
    FijarEntrada: Function,
    UserCommented: Function,
    DestacarEntrada: Function,
    // Refs
    UsuarioTieneAutoridad: Boolean,
    usuarioEsAdminODocente: Boolean,
    CopiarLink: Function,
});

watch(() => props.entrada, () => {
    console.log("Entrada cambiada")
    contenidoRender.value.ReloadContents(props.entrada)
});

const HabilitarPlaylist = computed(() => {
    // contar video en entrada
    const vidsEntrada = ContarVideos(props.entrada)
    // contar videos en comentarios
    const vidsComentarios = props.entrada.comentarios.docs.reduce((acc, com) => {
        return acc + ContarVideos(com)
    }, 0)
    // Si hay mas de 2 videos en la entrada o comentarios
    return vidsEntrada + vidsComentarios > 2
})

const ContarVideos = (contenido) => {
    return contenido.embedsYoutube.length + contenido.embedsVimeo.length
}
const AbrirPlaylist = () => {
    useNuxtApp().callHook("videoplaylist:open", {entrada: props.entrada})
}

const listaComentarios = ref()
const contenidoRender = ref()

const UserCommented = () => {
    listaComentarios.value.HideCommentbox();
}

const ToggleCommentBox = () => {
    listaComentarios.value.ToggleNewComment();
}

const menuRefs = ref({})
const ToggleArticleOptions = (event) => {
    const menu = menuRefs.value[props.entrada.id]
    if (menu && menu.toggle) {
        menu.toggle(event)
    }
};

const opcionesArticulo = ref([
    // Dejo comentada la opcion de copiar link
    // {
    //     label: 'Copiar Link',
    //     command: () => props.CopiarLink(),
    // },
]);
// Opciones si el usuario es el autor o parte del grupo
if (props.UsuarioTieneAutoridad) {
    opcionesArticulo.value = [
        ...opcionesArticulo.value,
        {
            label: 'Editar',
            command: () => {
                console.log('Editar');
                useNuxtApp().callHook("publicacion:editar", { entrada: props.entrada, html: contenidoRender.value.contenidoRendereado })
            }
        },
        {
            label: 'Eliminar',
            command: () => {
                props.EliminarEntrada();
            }
        },
    ];
}

let puedeFijar = false;
if (salonStore.currContext == "salon") {
    puedeFijar = props.usuarioEsAdminODocente; // si la entrada es un salon y el usuario es admin o docente
}
if (salonStore.currContext == "bitacora" && props.entrada.autor.id == auth.data.value.user.id) {
    puedeFijar = true; // si estamos en la bitacora del usuario actual
}
if (salonStore.currContext == "grupo") {
    puedeFijar = props.UsuarioTieneAutoridad; // si estamos en un grupo y el usuario es parte del grupo
}

// FIJAR

const opcionFijar = {
    label: !props.entrada.fijada ? 'Fijar' : 'Quitar Fijado',
    command: async () => props.FijarEntrada()
}
if (puedeFijar) {
    opcionesArticulo.value = [...opcionesArticulo.value, opcionFijar];
}

// DESTACAR
const opcionDestacar = {
    label: !props.entrada.destacada ? 'Destacar en El Salón' : 'Quitar destacado en El Salón',
    command: async () => props.DestacarEntrada()
}
if (props.usuarioEsAdminODocente) {
    opcionesArticulo.value = [...opcionesArticulo.value, opcionDestacar];
}

let removeOnEditHook = null;
const handlePublicacionEditada = async (data) => {
    if (data.resultado == "ok" && data.entrada.id == props.entrada.id) {
        contenidoRender.value.ReloadContent(data.entrada);
    }
}

onMounted(async () => {
    removeOnEditHook = hooks.hook('publicacion:editada', handlePublicacionEditada)
});

onUnmounted(() => {
    if (removeOnEditHook) removeOnEditHook()
})
</script>