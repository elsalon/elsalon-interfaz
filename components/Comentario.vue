<template>
    <Panel :toggleable="false" class="border-surface-0 background-red text-sm group/comentario panelComentario">
        <template #header>
            <NuxtLink :to="'/usuarios/' + comentario.autor.slug">
                <div class="flex items-center gap-2">
                    <AvatarSalon :usuario="comentario.autor" size="small" />
                    <span class="font-bold">{{ comentario.autor.nombre }}</span>
                </div>
            </NuxtLink>
        </template>
        
        <template #icons v-if="opcionesComment.length">
            <Button text @click="ToggleCommentOptions" class="invisible group-hover/comentario:visible">...</Button>
            <Menu :ref="el => menuCommentRefs[comentario.id] = el" id="overlay_menu_comment" :model="opcionesComment" :popup="true" class="text-xs" /> 
        </template>

        <DeferredContent>
            <div v-if="!editandoComentario" class="prose prose-headings:my-1 leading-normal text-sm" v-html="contenidoRendereado" :key="commentFoceRender"></div>
            <ListaArchivos v-if="archivos.length > 0 && !editandoComentario" :archivos="archivos"/>
            <CajaComentario v-if="editandoComentario" :commentEdit="commentEdit" @userPosted="handleUserEditedComment"/>
        </DeferredContent>
    </Panel>
</template>

<script setup>
    const toast = useToast();
    const { data : authData} = useAuth()
    const props = defineProps({
        comentario: {
            type: Object,
            required: true,
        },
    });
    const { comentario } = props;
    const archivos = ref(comentario.archivos)
    const emit = defineEmits(['eliminar']);

    const contenidoRendereado = ref('')
    // const comentario = ref(props.comentario)
    const commentEdit = ref(null)
    const editandoComentario = ref(false);
    const commentFoceRender = ref(0);
    const opcionesComment = ref([]);
    if(comentario.autor.id == authData.value.user.id){
        opcionesComment.value = [
        ...opcionesComment.value,
        {
            label: 'Editar',
            command: () => {
                console.log('Editar Comment');
                commentEdit.value = {entrada: comentario, html:contenidoRendereado.value}
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
        contenidoRendereado.value = await useRenderSalonHtml(doc)
    }

    const EliminarComentario = async () => {
        console.log('Eliminar entrada');
        try{
            const response = await useApi(`/api/comentarios/${comentario.id}`, {}, 'DELETE');
            console.log("Comentario eliminado:", response)
            emit('eliminar');
            toast.add({ severity: 'contrast', detail: 'Comentario eliminado', life: 3000});
        }catch(e){
            console.warn(e);
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el comentario', life: 3000});
        }
    }

    onMounted(async () => {
        contenidoRendereado.value = await useRenderSalonHtml(comentario)
    })
</script>