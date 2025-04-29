<template>
    <div class="group/entrada transition-all duration-500 ease-in-out p-1 entrada-default"
        :class="{ 'opacity-30': loading, 'bg-orange-50': resaltar }">
        <article>
            <!-- Para ocultar nombres hasta hover: opacity-0 group-hover:opacity-100 transition-opacity  -->
            <div class="flex pb-1">
                <NuxtLink :to="identidadUrl">
                    <AvatarSalon :usuario="identidad" v-tooltip.top="tooltipIdentidad" />
                </NuxtLink>
                <!-- <EntradaDefault /> -->

                <!-- Metadata entrada -->
                <div class="ml-4">
                    <NuxtLink :to="identidadUrl" class="hover:underline">
                        <h2 class="font-bold text-black line-clamp-1" v-tooltip.top="tooltipIdentidad">{{ identidad.nombre }}</h2>
                    </NuxtLink>
                    <div class="flex items-center">
                        <NuxtLink v-if="entrada.sala" class="text-sm mr-1 hover:underline text-zinc-600"
                            :to="GenerateSalaUrl(entrada.sala.slug)">{{ entrada.sala.nombre }}</NuxtLink>
                        <NuxtLink v-else="identidadUrl" class="text-sm mr-1 hover:underline text-zinc-600 "
                            :to="identidadUrl">Bitácora</NuxtLink>
                        <NuxtLink class="text-zinc-600 text-sm hover:underline" :to="`/entradas/${entrada.id}`">
                            <time :datetime="entrada.createdAt" class="text-zinc-600"
                                v-tooltip.top="$formatDate(entrada.createdAt)">{{ $formatDateRelative(entrada.createdAt)
                                }}</time>
                        </NuxtLink>
                        <!-- Entrada Fijada -->
                        <i v-if="entrada.fijada" class="pi pi-thumbtack text-zinc-600 ml-2" style="font-size: .65rem"
                            v-tooltip.top="'Entrada Fijada'"></i>
                        <!-- Entrada Destacada -->
                        <i v-if="entrada.destacada" class="pi pi-star text-zinc-600 ml-2" style="font-size: .7rem"
                            v-tooltip.top="'Entrada Destacada'"></i>
                    </div>
                </div>

                <!-- Menú ajustes entrada -->
                <div class="flex-grow md:invisible group-hover/entrada:visible text-right">
                    <Button text @click="ToggleArticleOptions">...</Button>
                    <Menu v-if="opcionesArticulo.length > 0" :ref="el => menuRefs[entrada.id] = el"
                        id="overlay_menu_article" :model="opcionesArticulo" :popup="true" class="text-xs" />
                </div>
            </div>
            <div
                class="prose prose-headings:font-semibold prose-headings:text-xl prose-headings:my-1 prose-p:my-0 leading-normal prose-img:my-2 break-words max-w-none">
                <ContenidoRendereado ref="contenidoRender" :contenido="entrada" />
            </div>
            <div class="" v-if="entrada.archivos.length">
                <ListaArchivos :archivos="entrada.archivos" />
            </div>
        </article>
        <div class="entrada-meta ml-0">
            <!-- <Divider /> -->
            <!-- Comentarios -->
            <!-- Agrego un margen abajo solo si hay comentarios pero no aparece el "Ver mas comentarios" -->
            <div class="actions mt-1" :class="{ 'mb-3': comentariosState.length > 0 && !hasNextPage }">
                <!-- Boton Comentar. Solo se muestra si no tiene comentarios -->
                <Aprecio :contenidoid="entrada.id" contenidotipo="entrada" :aprecioIniciales="entrada.aprecios" />
                <BtnComentar v-if="!comentariosState.length > 0" @click="ToggleCommentBox"
                    :labelCancelar="showCommentBox === '1'" />

                <Button v-if="HabilitarPlaylist" class="ml-auto group/playlist font-mono text-xs hover:text-black animate-pulse hover:animate-none" @click="AbrirPlaylist" link >
                    <span class="mr-1 opacity-0 group-hover/playlist:opacity-100 transition-opacity">Playlist</span>
                    <i class="pi pi-play-circle" />
                </Button>
            </div>
            <ListaComentarios :entradaId="entrada.id" :comentariosIniciales="entrada.comentarios"
                v-model:comentarios="comentariosState" v-model:hasNextPage="hasNextPage"
                v-model:showCommentBox="showCommentBox" @userPosted="UserCommented" ref="listaComentarios" />
        </div>
    </div>
</template>

<script setup>
const salonStore = useSalonStore()
const auth = useAuth()
const { $formatDate, $formatDateRelative } = useNuxtApp()
const { hooks } = useNuxtApp();
const { GenerateSalaUrl } = useGenerateSalaUrl()

const props = defineProps({
    entrada: Object,
    identidadUrl: String,
    tooltipIdentidad: String,
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

// Initialize state with the same data passed to the child component
const comentariosState = ref(props.entrada.comentarios?.docs || [])
const hasNextPage = ref(props.entrada.comentarios?.hasNextPage || false)
const showCommentBox = ref("0") // Default closed

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
</script>