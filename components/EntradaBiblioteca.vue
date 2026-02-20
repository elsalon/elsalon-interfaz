<template>
    <div class="group/entrada transition-all duration-300 entrada-biblioteca flex flex-col"
        :class="{ 'opacity-30': loading, 'bg-orange-50 dark:bg-gray-900': resaltar }">

        <!-- Cover Image -->
        <NuxtLink :to="`/entradas/${entrada.id}`" class="block">
            <figure v-if="entrada.imagenes?.length > 0" class="mb-3 aspect-[3/4]
                           transition-all duration-300
                           [filter:drop-shadow(0_1px_3px_rgba(0,0,0,0.06))_drop-shadow(1px_0_2px_rgba(0,0,0,0.04))]
                           dark:[filter:drop-shadow(0_1px_3px_rgba(0,0,0,0.3))_drop-shadow(1px_0_2px_rgba(0,0,0,0.2))]
                           hover:[filter:drop-shadow(0_2px_4px_rgba(0,0,0,0.08))_drop-shadow(1px_0_3px_rgba(0,0,0,0.05))]
                           dark:hover:[filter:drop-shadow(0_2px_4px_rgba(0,0,0,0.4))_drop-shadow(1px_0_3px_rgba(0,0,0,0.25))]
                           hover:-translate-y-1">
                <img :src="entrada.imagenes[0].imagen.sizes.medium.url" 
                     class="w-full h-full object-contain rounded-sm" />
            </figure>
            <div v-else class="mb-3 aspect-[3/4] rounded-sm
                               transition-all duration-300
                               hover:-translate-y-1
                               [filter:drop-shadow(0_1px_3px_rgba(0,0,0,0.06))_drop-shadow(1px_0_2px_rgba(0,0,0,0.04))]
                               dark:[filter:drop-shadow(0_1px_3px_rgba(0,0,0,0.3))_drop-shadow(1px_0_2px_rgba(0,0,0,0.2))]
                               hover:[filter:drop-shadow(0_2px_4px_rgba(0,0,0,0.08))_drop-shadow(1px_0_3px_rgba(0,0,0,0.05))]
                               dark:hover:[filter:drop-shadow(0_2px_4px_rgba(0,0,0,0.4))_drop-shadow(1px_0_3px_rgba(0,0,0,0.25))]
                               relative overflow-hidden flex items-center justify-center"
                 :style="{ background: getPlaceholderGradient() }">
                <div class="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
                     style="background-image: url('data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' /%3E%3C/svg%3E')">
                </div>
                <div class="text-6xl font-light text-white/20 dark:text-white/10 select-none">
                    {{ getInitial() }}
                </div>
            </div>
        </NuxtLink>
        
        <article class="flex flex-col flex-grow">
            

            <!-- Author & Meta -->
            <div class="mt-auto pt-2 flex items-start justify-between">
                <div>
                    <!-- <NuxtLink :to="identidadUrl" class="flex items-center gap-x-2 hover:underline">
                        <AvatarSalon :usuario="identidad" size="small" />
                        <span class="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-1">{{ identidad.nombre }}</span>
                    </NuxtLink> -->
                    <div class="flex justify-between items-center">
                        <!-- <NuxtLink class="text-zinc-500 dark:text-zinc-500 text-xs hover:underline mt-1 block" :to="`/entradas/${entrada.id}`">
                            <time :datetime="entrada.createdAt">{{ $formatDate(entrada.createdAt) }}</time>
                        </NuxtLink> -->
                        <Aprecio v-if="mostrarBtnAprecio" :contenidoid="entrada.id" contenidotipo="entrada" :aprecioIniciales="entrada.aprecios" />
                        <Guardar :contenidoId="entrada.id" relationTo="entradas" :guardadoPorUsuario="entrada.guardadoPorUsuario" class="mt-1" />
                    </div>
                </div>
                <div v-if="UsuarioTieneAutoridad" class="md:opacity-0 group-hover/entrada:opacity-100 transition-opacity">
                    <Button severity="contrast" text @click="ToggleArticleOptions">...</Button>
                    <Menu :ref="el => menuRefs[entrada.id] = el" id="overlay_menu_article" :model="opcionesArticulo"
                        :popup="true" class="text-xs" />
                </div>
            </div>

            <!-- Content -->
            <div class="flex-grow mb-3 opacity-100 md:opacity-0 group-hover/entrada:opacity-100 transition-opacity">
                <div v-if="entrada.archivos?.length" class="mt-2">
                    <ListaArchivos :archivos="entrada.archivos" />
                </div>
                <div v-else class="prose prose-sm prose-headings:text-base prose-headings:font-semibold prose-headings:my-1 prose-p:my-0 leading-relaxed break-words line-clamp-4 text-zinc-800 dark:text-zinc-200">
                    <ContenidoRendereado ref="contenidoRender" :contenido="entrada" />
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
    mostrarBtnAprecio: Boolean,
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

const getPlaceholderGradient = () => {
    const gradients = [
        'linear-gradient(135deg, #8b9198 0%, #6b7280 100%)', // slate grey
        'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)', // grey
        'linear-gradient(135deg, #78716c 0%, #57534e 100%)', // warm stone
        'linear-gradient(135deg, #71717a 0%, #52525b 100%)', // zinc
        'linear-gradient(135deg, #737373 0%, #525252 100%)', // neutral
        'linear-gradient(135deg, #64748b 0%, #475569 100%)', // slate blue
        'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)', // cool grey
        'linear-gradient(135deg, #7c7c7c 0%, #5a5a5a 100%)', // charcoal
        'linear-gradient(135deg, #78716c 0%, #44403c 100%)', // deep stone
        'linear-gradient(135deg, #6b7280 0%, #374151 100%)', // dark slate
    ];
    const hash = props.entrada.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
};

const getInitial = () => {
    if (props.entrada.titulo) {
        return props.entrada.titulo.charAt(0).toUpperCase();
    }
    if (props.identidad?.nombre) {
        return props.identidad.nombre.charAt(0).toUpperCase();
    }
    return '•';
};

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