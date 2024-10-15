<template>
    <div class="group/entrada" :class="{entradaNueva: entrada.nueva}">
        <article :key="reloadkey">
            <!-- Para ocultar nombres hasta hover: opacity-0 group-hover:opacity-100 transition-opacity  -->
            <div class="flex items-center pb-2">
                <NuxtLink :to="identidadUrl">
                    <AvatarSalon :usuario="identidad" />
                </NuxtLink>

                <div class="ml-4">
                    <NuxtLink :to="identidadUrl">
                        <h2 class="font-bold text-gray-700">{{ identidad.nombre }}</h2>
                    </NuxtLink>
                    <div class="flex items-center">
                        <NuxtLink v-if="entrada.sala" class="text-sm mr-2" :to="`/salones/${entrada.sala.slug}`">{{
            entrada.sala.nombre }}</NuxtLink>
                        <p class="text-gray-400 text-sm">{{ $formatDate(entrada.createdAt) }}</p>
                        <!-- Entrada Fijada -->
                        <i v-if="entrada.fijada" class="pi pi-thumbtack text-gray-400 ml-2" style="font-size: .65rem"
                            title="Entrada Fijada"></i>
                        <!-- Entrada Destacada -->
                        <i v-if="entrada.destacada" class="pi pi-star text-gray-400 ml-2" style="font-size: .7rem"
                            title="Entrada Destacada"></i>
                    </div>
                </div>
                <!-- Ajustes entrada -->
                <div class="flex-grow invisible group-hover/entrada:visible text-right">
                    <Button text @click="ToggleArticleOptions">...</Button>
                    <Menu :ref="el => menuRefs[entrada.id] = el" id="overlay_menu_article" :model="opcionesArticulo"
                        :popup="true" class="text-xs" />
                </div>
            </div>
            <DeferredContent @load="onEntradaLoaded">
                <div v-if="contenidoRendereado" class="prose prose-headings:my-1 sm:pl-[65px] leading-normal prose-img:my-2" @click="onEntradaClicked"
                    v-html="contenidoRendereado"></div>
                <div class="sm:pl-[65px]" v-if="archivos.length">
                    <ListaArchivos :archivos="archivos" />
                </div>
            </DeferredContent>

        </article>
        <div class="despues-entrada sm:pl-[65px]">
            <!-- <Divider /> -->
            <!-- Comentarios -->
            <div class="actions">
                <Button link class="my-2 text-xs text-surface-500" label="Comentar" @click="ToggleCommentBox" />
                <Aprecio :entradaId="entrada.id" />
            </div>
            <ListaComentarios :entradaId="entrada.id" :showCommentBox="showCommentBox"
                @userPosted="showCommentBox='0'" />
        </div>
    </div>


</template>

<script setup>
import PhotoSwipe from 'photoswipe';
import 'photoswipe/style.css';

const salonStore = useSalonStore()

import useRenderSalonHtml from '~/composables/useRenderSalonHtml';
const { hooks } = useNuxtApp();
const toast = useToast();
const { data: authData } = useAuth()
const props = defineProps({
    entrada: {
        type: Object,
        required: true,
    },
});
const reloadkey = ref(0);
const { entrada } = props;
const emit = defineEmits(['eliminar']);
const showCommentBox = ref('0');
const ToggleCommentBox = () => {
    showCommentBox.value = showCommentBox.value == '0' ? '1' : '0';
}

const { $formatDate } = useNuxtApp()

const identidad = ref();
const identidadUrl = ref();
const DefinirIdentidad = (doc = entrada) => {
    identidad.value = doc.autoriaGrupal ? doc.grupo : doc.autor;
    identidadUrl.value = doc.autoriaGrupal ? `/grupos/${identidad.value.slug}` : `/usuarios/${identidad.value.slug}`;
}
DefinirIdentidad();

const UsuarioTieneAutoridad = () => {
    if (entrada.autoriaGrupal) {
        return entrada.grupo?.integrantes.find(i => i.id == authData.value.user.id)
    } else {
        return entrada.autor.id == authData.value.user.id
    }
}

const opcionesArticulo = ref([
    {
        label: 'Copiar Link',
        command: () => {
            const url = `${window.location.origin}/entradas/${entrada.id}`;
            navigator.clipboard.writeText(url);
            toast.add({ severity: 'contrast', detail: 'Link copiado', life: 3000 });
        }
    },
]);
// Opciones si el usuario es el autor o parte del grupo
if (UsuarioTieneAutoridad()) {
    opcionesArticulo.value = [
        ...opcionesArticulo.value,
        {
            label: 'Editar',
            command: () => {
                console.log('Editar');
                useNuxtApp().callHook("publicacion:editar", { entrada, html: contenidoRendereado.value })
            }
        },
        {
            label: 'Eliminar',
            command: () => {
                EliminarEntrada();
            }
        },
    ];
}
// Opciones si el usuario es admin o docente
// console.log(salonStore.currContext, salonStore.contextoId)
// console.log("Fijada: ", entrada.fijada)
const usuarioEsAdminODocente = authData.value.user.isAdmin || authData.value.user.rol == "docente";
let puedeFijar = false;
if (salonStore.currContext == "salon") {
    puedeFijar = usuarioEsAdminODocente; // si la entrada es un salon y el usuario es admin o docente
}
if (salonStore.currContext == "bitacora" && entrada.autor.id == authData.value.user.id) {
    puedeFijar = true; // si estamos en la bitacora del usuario actual
}
if (salonStore.currContext == "grupo") {
    puedeFijar = UsuarioTieneAutoridad(); // si estamos en un grupo y el usuario es parte del grupo
}

// DESTACAR
const opcionDestacar = {
    label: !entrada.destacada ? 'Destacar en El Salón' : 'Quitar destacado en El Salón',
    command: async () => {
        // console.log('Destacar');
        await useApi(`/api/entradas/${entrada.id}`, { destacada: !entrada.destacada }, 'PATCH');
        useNuxtApp().callHook("publicacion:fijada");
    }
}
if (usuarioEsAdminODocente) {
    opcionesArticulo.value = [...opcionesArticulo.value, opcionDestacar];
}

// // FIJAR
const opcionFijar = {
    label: !entrada.fijada ? 'Fijar' : 'Quitar Fijado',
    command: async () => {
        if (entrada.fijada) {
            await useApi(`/api/fijadas/${entrada.fijada}`, {}, 'DELETE');
        } else {
            await useApi(`/api/fijadas`, { contexto: salonStore.contextoId, entrada: entrada.id }, 'POST');
        }
        useNuxtApp().callHook("publicacion:fijada");
    }
}
if (puedeFijar) {
    opcionesArticulo.value = [...opcionesArticulo.value, opcionFijar];
}


const menuRefs = ref({})
const ToggleArticleOptions = (event) => {
    const menu = menuRefs.value[entrada.id]
    if (menu && menu.toggle) {
        menu.toggle(event)
    }
};

const contenidoRendereado = ref('')
const archivos = ref(entrada.archivos)

const EliminarEntrada = async () => {
    try {
        const response = await useApi(`/api/entradas/${entrada.id}`, {}, 'DELETE');
        console.log("Entrada eliminada:", response)
        emit('eliminar');
        toast.add({ severity: 'contrast', detail: 'Entrada eliminada', life: 3000 });
    } catch (e) {
        console.warn(e);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la entrada', life: 3000 });
    }
}

let removeOnEditHook = null;

const handlePublicacionEditada = async (data) => {
    if (data.resultado == "ok" && data.entrada.id == entrada.id) {
        entrada.value = data.entrada
        contenidoRendereado.value = await useRenderSalonHtml(data.entrada);
        archivos.value = data.entrada.archivos
        console.log("autoriaGrupal", entrada.autoriaGrupal, data.entrada.autoriaGrupal)
        DefinirIdentidad(data.entrada)
        reloadkey.value++
    }
    // // Publicacion exitosa. Cierro el dialogo y muestro un toast
    // toast.add({ severity: 'contrast', detail: 'Entrada editada', life: 3000});   
    // contenidoRendereado.value = data.html
    // console.log('User edited', data)
    // entrada.contenido = data.html
    // contenidoRendereado.value = data.html
}

onMounted(async () => {
    contenidoRendereado.value = await useRenderSalonHtml(entrada);
    removeOnEditHook = hooks.hook('publicacion:editada', handlePublicacionEditada)
});
onUnmounted(() => {
    if (removeOnEditHook) removeOnEditHook()
})

let galleryPswp = null;
let galleryOptions = null;

const onEntradaLoaded = () => {
    if (entrada.imagenes.length == 0) return;
    const dataSource = entrada.imagenes.map(img => {
        return {
            src: img.imagen.url,
            w: img.imagen.width,
            h: img.imagen.height,
        }
    });

    galleryOptions = {
        dataSource,
        showHideAnimationType: 'none',
        initialZoomLevel: 'fit',
        secondaryZoomLevel: 1.5,
        maxZoomLevel: 4,
    };
    galleryOptions.index = 0; // defines start slide index        
}

const onEntradaClicked = (event) => {
    if (event.target.tagName === 'IMG') {
        const imgSrc = event.target.src;
        handleImageClick(imgSrc);
    }
}

const handleImageClick = (src) => {
    if (galleryPswp) {
        galleryPswp.close();  // or use galleryPswp.destroy() depending on the version
    }

    galleryOptions.index = galleryOptions.dataSource.findIndex((img) => img.src === src);
    galleryPswp = new PhotoSwipe(galleryOptions);
    galleryPswp.init();
}

</script>