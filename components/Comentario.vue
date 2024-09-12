<template>
    <Panel :toggleable="false" class="border-surface-0 background-red text-sm group/comentario">
        <template #header>
            <div class="flex items-center gap-2">
                <AvatarSalon :usuario="comentario.autor" size="small" />
                <span class="font-bold">{{ comentario.autor.nombre }}</span>
            </div>
        </template>
        
        <template #icons >
            <Button text @click="ToggleCommentOptions" class="invisible group-hover/comentario:visible">...</Button>
            <Menu :ref="el => menuCommentRefs[comentario.id] = el" id="overlay_menu_comment" :model="opcionesComment" :popup="true" class="text-xs" /> 
        </template>

        <DeferredContent>
            <div class="prose prose-headings:my-1 leading-normal text-sm" v-html="comentario.contenido"></div>
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


const opcionesComment = ref([
        {
            label: 'Copiar Link',
            command: () => {
                console.log('Copiar Link');
            }
        },
    ]);
const menuCommentRefs = ref({})
const ToggleCommentOptions = (event) => {
    const menu = menuCommentRefs.value[props.comentario.id]
    if (menu && menu.toggle) {
        menu.toggle(event)
    }
};
</script>