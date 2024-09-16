<template>
    <Panel :toggleable="false" class="border-surface-0 background-red text-sm group/comentario panelComentario">
        <template #header>
            <NuxtLink :to="'/usuarios/' + miComentario.autor.slug">
                <div class="flex items-center gap-2">
                    <AvatarSalon :usuario="miComentario.autor" size="small" />
                    <span class="font-bold">{{ miComentario.autor.nombre }}</span>
                </div>
            </NuxtLink>
        </template>
        
        <template #icons >
            <Button text @click="ToggleCommentOptions" class="invisible group-hover/comentario:visible">...</Button>
            <Menu :ref="el => menuCommentRefs[miComentario.id] = el" id="overlay_menu_comment" :model="opcionesComment" :popup="true" class="text-xs" /> 
        </template>

        <DeferredContent>
            <div v-if="!editandoComentario" class="prose prose-headings:my-1 leading-normal text-sm" v-html="contenidoRendereado" :key="commentFoceRender"></div>
            <CajaComentario v-if="editandoComentario" :commentEdit="commentEdit" @userPosted="handleUserEditedComment"/>
        </DeferredContent>
    </Panel>
</template>

<script setup>

const props = defineProps({
    comentario: {
        type: Object,
        required: true,
    },
});
const contenidoRendereado = ref('')

const miComentario = ref(props.comentario)
const commentEdit = ref(null)
const editandoComentario = ref(false);
const commentFoceRender = ref(0);
const opcionesComment = ref([
        {
            label: 'Editar',
            command: () => {
                console.log('Editar Comment');
                commentEdit.value = {entrada: miComentario, html:contenidoRendereado.value}
                editandoComentario.value = true;
            }
        },
    ]);
const menuCommentRefs = ref({})
const ToggleCommentOptions = (event) => {
    const menu = menuCommentRefs.value[miComentario.value.id]
    if (menu && menu.toggle) {
        menu.toggle(event)
    }
};

const handleUserEditedComment = async (doc) => {
    console.log('User edited comment', doc)
    editandoComentario.value = false;
    miComentario.value = doc
    contenidoRendereado.value = await useRenderSalonHtml(doc)
    // commentFoceRender.value++;
}

onMounted(async () => {
    contenidoRendereado.value = await useRenderSalonHtml(miComentario.value)
})
</script>