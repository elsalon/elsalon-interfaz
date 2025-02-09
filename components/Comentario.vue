<template>
    <Panel :toggleable="false"
        class="mb-3 border-surface-0 text-sm group/comentario panelComentario transition-all duration-500 ease-in-out"
        :class="{ 'opacity-30': loading, 'bg-orange-50': resaltar }" ref="comentarioDom">
        <template #header>
            <NuxtLink :to="identidadUrl">
                <div class="flex items-center gap-2">
                    <AvatarSalon :usuario="identidad" size="small" :title="tituloIdentidad" style="font-size: .6rem;" />
                    <span class="font-bold" :title="tituloIdentidad">{{ identidad.nombre }}</span>
                    <span class="text-gray-300 text-xs">{{ $formatDate(comentario.createdAt) }}</span>
                </div>
            </NuxtLink>
        </template>

        <template #icons v-if="opcionesComment.length">
            <Button text @click="ToggleCommentOptions" class="md:invisible group-hover/comentario:visible">...</Button>
            <Menu :ref="el => menuCommentRefs[comentario.id] = el" id="overlay_menu_comment" :model="opcionesComment"
                :popup="true" class="text-xs" />
        </template>

        <div v-show="!editandoComentario" class="prose prose-sm prose-headings:my-1 leading-none break-words">
            <ContenidoRendereado ref="contenidoRender" :contenido="comentario" />
        </div>

        <ListaArchivos v-if="archivos.length > 0 && !editandoComentario" :archivos="archivos" />
        <DeferredContent>
        <CajaComentario v-if="editandoComentario" :commentEdit="commentEdit" @userPosted="handleUserEditedComment"
            @cancelComment="handleUserCancelComment" />
        </DeferredContent>

        <div class="actions">
            <Button v-show="isLast" link class="my-2 text-xs text-surface-500" label="Comentar"
                @click="ToggleComment" />
            <Aprecio :contenidoid="comentario.id" contenidotipo="comentario"
                :aprecioIniciales="comentario.aprecios" />
        </div>
    </Panel>
</template>

<script setup>
import { useConfirm } from "primevue/useconfirm";
const confirm = useConfirm();
const toast = useToast();
const { $formatDate } = useNuxtApp()
const auth = useAuth()
const props = defineProps({
    comentario: {
        type: Object,
        required: true,
    },
    isLast: {
        type: Boolean,
        default: false,
    }
});

const comentarioDom = ref();
const resaltar = ref(false)
const { comentario } = props;
const archivos = ref(comentario.archivos)
const emit = defineEmits(['eliminar', 'toggleCommentBox']);

const loading = ref(false);
const contenidoRender = ref()
// const comentario = ref(props.comentario)
const commentEdit = ref(null)
const editandoComentario = ref(false);
const opcionesComment = ref([]);

const identidad = ref();
const identidadUrl = ref();
const tituloIdentidad = ref("")

identidad.value = comentario.autoriaGrupal ? comentario.grupo : comentario.autor;
tituloIdentidad.value = comentario.autoriaGrupal ? comentario.grupo.integrantes.map(x => x.nombre).join(", ") : comentario.autor.nombre;
identidadUrl.value = comentario.autoriaGrupal ? `/grupos/${identidad.value.slug}` : `/usuarios/${identidad.value.slug}`;

const ToggleComment = () => { emit('toggleCommentBox'); }
const UsuarioTieneAutoridad = () => {
    if (comentario.autoriaGrupal) {
        return comentario.grupo?.integrantes.find(i => i.id == auth.data.value.user.id)
    } else {
        return comentario.autor.id == auth.data.value.user.id
    }
}

if (UsuarioTieneAutoridad()) {
    opcionesComment.value = [
        ...opcionesComment.value,
        {
            label: 'Editar',
            command: () => {
                console.log('Editar Comment');
                commentEdit.value = { entrada: comentario, html: contenidoRender.value.contenidoRendereado }
                editandoComentario.value = true;
            }
        },
        {
            label: 'Eliminar',
            command: () => {
                EliminarComentario();
            }
        },
    ];
}

const menuCommentRefs = ref({})
const ToggleCommentOptions = (event) => {
    const menu = menuCommentRefs.value[comentario.id]
    if (menu && menu.toggle) {
        menu.toggle(event)
    }
};

const handleUserEditedComment = async (doc) => {
    console.log('User edited comment', doc)
    editandoComentario.value = false;
    comentario.value = doc
    archivos.value = doc.archivos
    contenidoRender.value.ReloadContent(doc);
    ResaltarComentario();
}

const ResaltarComentario = () => {
    console.log('Resaltar comentario');
    resaltar.value = true;
    setTimeout(() => {
        resaltar.value = false;
    }, 3000);
}

const handleUserCancelComment = () => {
    console.log('User canceled edit comment');
    editandoComentario.value = false;
}

const EliminarComentario = async () => {
    try {
        confirm.require({
            message: 'Estás seguro de borrar este comentario?',
            header: 'Borrar comentario',
            rejectProps: {
                label: 'Cancelar',
                severity: 'secondary',
                outlined: true
            },
            acceptProps: {
                label: 'Borrar'
            },
            reject: () => {
                console.log('Borrar comentario cancelada');
            },
            accept: async () => {
                loading.value = true;
                const response = await useAPI(`/api/comentarios/${comentario.id}`, { method: 'DELETE' });
                console.log("Comentario eliminado:", response)
                emit('eliminar');
                toast.add({ severity: 'contrast', detail: 'Comentario borrado', life: 3000 });
            },
        });
    } catch (e) {
        console.warn(e);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el comentario', life: 3000 });
        loading.value = false;
    }
}

defineExpose({ ResaltarComentario });
</script>