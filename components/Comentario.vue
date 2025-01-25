<template>
    <Panel :toggleable="false" class="mb-3 border-surface-0 background-red text-sm group/comentario panelComentario">
        <template #header>
            <NuxtLink :to="identidadUrl">
                <div class="flex items-center gap-2">
                    <AvatarSalon :usuario="identidad" size="small" :title="tituloIdentidad" />
                    <span class="font-bold" :title="tituloIdentidad">{{ identidad.nombre }}</span>
                    <span class="text-gray-300 text-xs" >{{ $formatDate(comentario.createdAt) }}</span>
                </div>
            </NuxtLink>
        </template>

        <template #icons v-if="opcionesComment.length">
            <Button text @click="ToggleCommentOptions" class="invisible group-hover/comentario:visible">...</Button>
            <Menu :ref="el => menuCommentRefs[comentario.id] = el" id="overlay_menu_comment" :model="opcionesComment"
                :popup="true" class="text-xs" />
        </template>

        <DeferredContent>
            <div v-show="!editandoComentario" class="prose prose-sm prose-headings:my-1 leading-none break-words">
                <ContenidoRendereado ref="contenidoRender" :contenido="comentario" />
            </div>
            <ListaArchivos v-if="archivos.length > 0 && !editandoComentario" :archivos="archivos" />
            <CajaComentario v-if="editandoComentario" :commentEdit="commentEdit"
                @userPosted="handleUserEditedComment" />
            <Aprecio :contenidoid="comentario.id" contenidotipo="comentario" />
        </DeferredContent>
    </Panel>
</template>

<script setup>
const toast = useToast();
const { $formatDate } = useNuxtApp()
const { data: authData } = useAuth()
const props = defineProps({
    comentario: {
        type: Object,
        required: true,
    },
});
const { comentario } = props;
const archivos = ref(comentario.archivos)
const emit = defineEmits(['eliminar']);

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

if (comentario.autor.id == authData.value.user.id) {
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
}

const EliminarComentario = async () => {
    console.log('Eliminar entrada');
    try {
        const response = await useAPI(`/api/comentarios/${comentario.id}`, { method: 'DELETE' });
        console.log("Comentario eliminado:", response)
        emit('eliminar');
        toast.add({ severity: 'contrast', detail: 'Comentario eliminado', life: 3000 });
    } catch (e) {
        console.warn(e);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el comentario', life: 3000 });
    }
}
</script>