<template>
    <div class="group/entrada" :class="{entradaNueva: entrada.nueva}">
        <article>
            <!-- Para ocultar nombres hasta hover: opacity-0 group-hover:opacity-100 transition-opacity  -->
            <div class="flex pb-2">
                <NuxtLink :to="identidadUrl">
                    <AvatarSalon :usuario="identidad" />
                </NuxtLink>

                <!-- Metadata entrada -->
                <div class="ml-4">
                    <NuxtLink :to="identidadUrl">
                        <h2 class="font-bold text-gray-700">{{ identidad.nombre }}</h2>
                    </NuxtLink>
                    <div class="flex items-center">
                        <NuxtLink v-if="entrada.sala" class="text-sm mr-2" :to="`/salones/${entrada.sala.slug}`">{{ entrada.sala.nombre }}</NuxtLink>
                        <NuxtLink v-else="identidadUrl" class="text-sm mr-2" :to="identidadUrl">Bitácora</NuxtLink>
                        <p class="text-gray-400 text-sm">{{ $formatDate(entrada.createdAt) }}</p>
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
                    <Menu :ref="el => menuRefs[entrada.id] = el" id="overlay_menu_article" :model="opcionesArticulo"
                        :popup="true" class="text-xs" />
                </div>
            </div>
            <DeferredContent>
                <div class="prose prose-headings:text-xl prose-headings:my-1 sm:pl-[65px] leading-normal prose-img:my-2 break-words">
                    <ContenidoRendereado ref="contenidoRender" :contenido="entrada"/>
                </div>
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
                <Aprecio :contenidoid="entrada.id" contenidotipo="entrada" />
            </div>
            <ListaComentarios :entradaId="entrada.id" :showCommentBox="showCommentBox"
                @userPosted="UserCommented" />
        </div>
    </div>


</template>

<script setup>
const salonStore = useSalonStore()
const { hooks } = useNuxtApp();
const toast = useToast();
const { data: authData } = useAuth()
const props = defineProps({
    entrada: {
        type: Object,
        required: true,
    },
});
const contenidoRender = ref() 
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
                useNuxtApp().callHook("publicacion:editar", { entrada, html: contenidoRender.value.contenidoRendereado })
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
        const body = { destacada: !entrada.destacada };
        await useAPI(`/api/entradas/${entrada.id}`, {body, method: "PATCH" });
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
            await useAPI(`/api/fijadas/${entrada.fijada}`, {method: 'DELETE'});
        } else {
            const method = 'POST';
            const body = { contexto: salonStore.contextoId, entrada: entrada.id };
            await useAPI(`/api/fijadas`, {body, method});
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

const archivos = ref(entrada.archivos)

const EliminarEntrada = async () => {
    try {
        const response = await useAPI(`/api/entradas/${entrada.id}`, {method: 'DELETE'});
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
        archivos.value = data.entrada.archivos
        // console.log("autoriaGrupal", entrada.autoriaGrupal, data.entrada.autoriaGrupal)
        DefinirIdentidad(data.entrada)
        contenidoRender.value.ReloadContent(data.entrada);
    }
    // // Publicacion exitosa. Cierro el dialogo y muestro un toast
    // toast.add({ severity: 'contrast', detail: 'Entrada editada', life: 3000});   
    // contenidoRendereado.value = data.html
    // console.log('User edited', data)
    // entrada.contenido = data.html
    // contenidoRendereado.value = data.html
}

onMounted(async () => {
    removeOnEditHook = hooks.hook('publicacion:editada', handlePublicacionEditada)
});
onUnmounted(() => {
    if (removeOnEditHook) removeOnEditHook()
})


const UserCommented = () => {
    showCommentBox.value = '0';
}

</script>
