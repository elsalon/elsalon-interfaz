<template>
    <div>
        <button v-if="comentariosRestantes > 0 && !props.comentarios.fetching" class="w-full my-2 text-gray-400 hover:text-gray-800 text-sm"
            @click="emit('fetchComentarios')">
            Ver más comentarios ({{ comentariosRestantes }})
        </button>
        <div v-if="props.comentarios.fetching" class="my-2 w-full text-center text-gray-500 text-sm">
            <span class="texto-cargando">
                Cargando comentarios...
            </span>
        </div>

        <div class="pl-0 pt-2 border-l-1 border-gray-100 relative">
            <Comentario v-for="(comentario, index) in props.comentarios.docs" :comentario="comentario" :key="comentario.id"
                @eliminar="EliminarComentario(comentario.id)" @toggleCommentBox="ToggleNewComment"
                :ref="(el) => setComentarioRef(el, comentario.id)" :isLast="index === props.comentarios.docs.length - 1" />

            <Accordion :value="showCommentBox">
                <AccordionPanel value="1">
                    <AccordionContent>
                        <CajaComentario v-if="showCommentBox == '1'" :entradaId="entradaId"
                            @userPosted="handleUserPostedComment" @cancelComment="handleUserCancelComment"
                            :key="cajaComentarioKey" ref="cajaComentario" />
                    </AccordionContent>
                </AccordionPanel>
            </Accordion>
        </div>
    </div>
</template>

<script setup>
import CajaComentario from './CajaComentario.vue';

const props = defineProps({
    entradaId: {
        type: String,
        required: true,
    },
    comentarios: {
        type: Object,
        required: true,
    }
})


const comentariosRestantes = computed(() => props.comentarios.totalDocs - props.comentarios.docs.length)
const showCommentBox = ref("0")

const cajaComentarioKey = ref(0)
const cajaComentario = ref(null)

const emit = defineEmits(['userPosted', 'fetchComentarios'])

const ToggleNewComment = () => {
    showCommentBox.value = showCommentBox.value == '0' ? '1' : '0';
}
const HideCommentbox = () => {
    showCommentBox.value = '0';
}

const comentarioRefs = ref({});

function setComentarioRef(el, id) {
    if (el) {
        comentarioRefs.value[id] = el;
    }
}

const handleUserPostedComment = async (comentario) => {
    console.log('User posted comment', comentario)
    // await fetchNewerComments()
    emit('userPosted'); // lo vuelvo a emitir a "Entrada" para que cierre el accordion
    cajaComentario.value.ClearEditor();
    // Wait until the new comment is rendered
    while(!comentarioRefs.value[comentario.id]) {
        await new Promise(r => setTimeout(r, 100));
    }
    comentarioRefs.value[comentario.id].ResaltarComentario();
}

const handleUserCancelComment = () => {
    console.log('User canceled comment')
    emit('userPosted'); // lo vuelvo a emitir a "Entrada" para que cierre el accordion
}

const EliminarComentario = (id) => {
    props.comentarios.docs = props.comentarios.docs.filter(comentario => comentario.id != id)
    // props.comentarios.value = props.comentarios.value.filter(comentario => comentario.id != id)
}

defineExpose({ ToggleNewComment, HideCommentbox })
</script>