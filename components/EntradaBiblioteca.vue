<template>
    <div class="group/entrada transition-all duration-500 ease-in-out entrada-biblioteca flex flex-row-reverse md:flex-col"
        :class="{ 'opacity-30': loading, 'bg-orange-50': resaltar }">

        <figure v-if="entrada.imagenes.length > 0" class="ml-5 md:ml-0 ">
            <img :src="entrada.imagenes[0].imagen.sizes.medium.url" class="max-w-32 object-cover aspect-[6/9] md:w-full md:max-w-none" />
        </figure>

        <article class="flex flex-col flex-grow">
            <div class="flex-grow">
                <div class="prose prose-headings:text-xl prose-headings:my-1 leading-normal prose-img:my-2 break-words">
                    <ContenidoRendereado ref="contenidoRender" :contenido="entrada" />
                </div>
                <div class="sm:pl-[65px]" v-if="entrada.archivos.length">
                    <ListaArchivos :archivos="entrada.archivos" />
                </div>
            </div>
            <div class="despues-entrada">
                <NuxtLink :to="identidadUrl" class="link flex items-center gap-x-2">
                    <AvatarSalon :usuario="identidad" :title="tituloIdentidad" size="small" />
                    <h2 class=" text-gray-400  text-sm" :title="tituloIdentidad">{{ identidad.nombre }}</h2>
                </NuxtLink>
                <NuxtLink class="text-gray-400 text-xs hover:underline" :to="`/entradas/${entrada.id}`">
                    {{ $formatDate(entrada.createdAt) }}</NuxtLink>
            </div>
        </article>
    </div>
</template>

<script setup>
const salonStore = useSalonStore()
const { data: authData } = useAuth()
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
    {
        label: 'Copiar Link',
        command: () => props.CopiarLink(),
    },
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
if (salonStore.currContext == "bitacora" && props.entrada.autor.id == authData.value.user.id) {
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