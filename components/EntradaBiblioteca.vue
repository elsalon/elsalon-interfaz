<template>
    <div class="group/entrada transition-all entrada-biblioteca flex md:flex-col"
        :class="{ 'opacity-30': loading, 'bg-orange-50': resaltar }">

        
        
        <NuxtLink :to="`/entradas/${entrada.id}`">
            <figure v-if="entrada.imagenes.length > 0" class="mr-5 md:mr-0 ">
                <img :src="entrada.imagenes[0].imagen.sizes.medium.url" class="max-w-32 object-cover aspect-[6/9] md:w-full md:max-w-none" />
            </figure>
        </NuxtLink>
        
        <article class="flex flex-col flex-grow overflow-auto">
            <div class="flex-grow mb-2">
                <div class="prose prose-headings:text-xl prose-headings:font-semibold prose-headings:my-1 prose-p:my-0 leading-normal prose-img:my-2 break-words line-clamp-6">
                    <ContenidoRendereado ref="contenidoRender" :contenido="entrada" />
                </div>
                <div v-if="entrada.archivos.length">
                    <ListaArchivos :archivos="entrada.archivos" />
                </div>
            </div>
            
            <div class="entrada-meta flex items-center mb-1 md:opacity-0 group-hover/entrada:opacity-100 transition-opacity duration-300">
                <NuxtLink :to="identidadUrl" class="flex items-center gap-x-2 hover:underline mr-1">
                    <AvatarSalon :usuario="identidad" size="small" />
                    <h2 class="text-zinc-600 text-sm line-clamp-1">{{ identidad.nombre }}</h2>
                </NuxtLink>
                <NuxtLink class="text-zinc-600 text-xs hover:underline" :to="`/entradas/${entrada.id}`" v-tooltip.top="$formatDate(entrada.createdAt)">
                    <time :datetime="entrada.createdAt">{{ $formatDateRelative(entrada.createdAt) }}</time>
                </NuxtLink>
                <div v-if="UsuarioTieneAutoridad" class="flex-grow md:invisible group-hover/entrada:visible text-right">
                    <Button text @click="ToggleArticleOptions">...</Button>
                    <Menu :ref="el => menuRefs[entrada.id] = el" id="overlay_menu_article" :model="opcionesArticulo"
                        :popup="true" class="text-xs opacity-100" />
                    </div>
                </div>
            </article>
    </div>
</template>

<script setup>
const salonStore = useSalonStore()
const auth = useAuth()
const {$formatDate, $formatDateRelative } = useNuxtApp()
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


const contenidoRender = ref()
const menuRefs = ref({})
const ToggleArticleOptions = (event) => {
    const menu = menuRefs.value[props.entrada.id]
    if (menu && menu.toggle) {
        menu.toggle(event)
    }
};

const opcionesArticulo = ref([]);
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