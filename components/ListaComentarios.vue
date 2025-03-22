<template>
    <div>
        <div class="w-full text-center">
            <Button v-if="hasNextPageLocal && !fetchingComentarios" link class="mb-2 !text-zinc-600 text-xs leading-normal"
                @click="fetchComentarios" :label="`Ver más comentarios (${comentariosRestantes})`"/>
        </div>

        <div v-if="fetchingComentarios" class="mb-2 p-2 w-full text-center text-zinc-600 text-xs leading-normal">
            <span class="texto-cargando">
                Cargando comentarios...
            </span>
        </div>

        <div class="pl-0 border-l-1 border-zinc-100 relative" >
            <template v-if="comentariosLocal.length > 0">
                <Comentario v-for="(comentario, index) in comentariosLocal" :comentario="comentario" :key="comentario.id"
                    @eliminar="EliminarComentario(comentario.id)" @toggleCommentBox="ToggleNewComment"
                    :ref="(el) => setComentarioRef(el, comentario.id)" :isLast="index === comentariosLocal.length - 1" />
                
                <BtnComentar @click="ToggleNewComment" :labelCancelar="showCommentBoxLocal === '1'" />
            </template> 

            <Accordion :value="showCommentBoxLocal">
                <AccordionPanel value="1">
                    <AccordionContent>
                        <CajaComentario v-if="showCommentBoxLocal == '1'" :entradaId="entradaId"
                            @userPosted="handleUserPostedComment" @cancelComment="handleUserCancelComment"
                            :key="cajaComentarioKey" ref="cajaComentario" />
                    </AccordionContent>
                </AccordionPanel>
            </Accordion>
        </div>
    </div>
</template>

<script setup>
import qs from 'qs';
import CajaComentario from './CajaComentario.vue';

const props = defineProps({
    entradaId: {
        type: String,
        required: true,
    },
    comentariosIniciales: {
        type: Object,
        required: true,
    },
    comentarios: {
        type: Array,
        default: () => []
    },
    hasNextPage: {
        type: Boolean,
        default: false
    },
    showCommentBox: {
        type: String,
        default: "0"
    }
})

const hasNextPageLocal = computed({
    get: () => props.hasNextPage,
    set: (val) => emit('update:hasNextPage', val)
})

const comentariosRestantes = ref(0)
const comentariosLocal = computed({
    get: () => props.comentarios.length > 0 ? props.comentarios : props.comentariosIniciales.docs,
    set: (val) => emit('update:comentarios', val)
})
const newestCommentDate = computed(() => comentariosLocal.value.length > 0 ? comentariosLocal.value[comentariosLocal.value.length - 1].createdAt : null)
const oldestCommentDate = computed(() => comentariosLocal.value.length > 0 ? comentariosLocal.value[0].createdAt : null)

const showCommentBoxLocal = computed({
    get: () => props.showCommentBox,
    set: (val) => emit('update:showCommentBox', val)
})

const cajaComentarioKey = ref(0)
const fetchingComentarios = ref(false)
const cajaComentario = ref(null)

const emit = defineEmits(['userPosted', 'update:comentarios', 'update:hasNextPage', 'update:showCommentBox'])

onMounted(() => {
    comentariosLocal.value = props.comentariosIniciales.docs
    hasNextPageLocal.value = props.comentariosIniciales.hasNextPage
    comentariosRestantes.value = props.comentariosIniciales.totalDocs - comentariosLocal.value.length
})

const ToggleNewComment = () => {
    showCommentBoxLocal.value = showCommentBoxLocal.value === '0' ? '1' : '0';
}
const HideCommentbox = () => {
    showCommentBoxLocal.value = '0';
}

const comentarioRefs = ref({});

function setComentarioRef(el, id) {
    if (el) {
        comentarioRefs.value[id] = el;
    }
}

const fetchComentarios = async () => {
    fetchingComentarios.value = true
    let query = {
        where: {
            and: [
                { entrada: { equals: props.entradaId } },
            ]
        },
        sort: '-createdAt',
        limit: 3,
    }
    // Si ya hay comentarios, fetch los anterior al mas viejo de la lista
    if (oldestCommentDate.value) {
        query.where.and.push({ createdAt: { less_than: oldestCommentDate.value } })
    }
    console.log("Fetch comentarios", query)
    const queryParams = qs.stringify(query, { encode: false });
    const res = await useAPI(`/api/comentarios?${queryParams}`)

    var newComments = res.docs.filter(newComment =>
        !comentariosLocal.value.some(existingComment => existingComment.id === newComment.id)
    )
    newComments = newComments.reverse()
    comentariosLocal.value = [...newComments, ...comentariosLocal.value]
    hasNextPageLocal.value = res.hasNextPage;
    comentariosRestantes.value = res.totalDocs - res.docs.length

    fetchingComentarios.value = false
}

const fetchNewerComments = async () => {
    // Si no hay comentarios, fetch el primer set de comentarios
    if (!newestCommentDate.value) {
        console.log("No hay comentarios, fetchComentarios")
        await fetchComentarios()
        return
    }
    fetchingComentarios.value = true
    console.log("Fetwching nwer than", newestCommentDate.value)
    const query = {
        where: {
            and: [
                { entrada: { equals: props.entradaId } },
                { createdAt: { greater_than: newestCommentDate.value } }
            ]
        },
        sort: 'createdAt',
    }
    const queryParams = qs.stringify(query, { encode: false });
    const res = await useAPI(`/api/comentarios?${queryParams}`)
    const newComments = res.docs.filter(newComment => !comentariosLocal.value.some(existingComment => existingComment.id === newComment.id))
    comentariosLocal.value = [...comentariosLocal.value, ...newComments]

    if (newComments.length > 0) {
        newestCommentDate.value = newComments[0].createdAt
    }
    fetchingComentarios.value = false
}

const handleUserPostedComment = async (comentario) => {
    console.log('User posted comment', comentario)
    await fetchNewerComments()
    emit('userPosted'); // lo vuelvo a emitir a "Entrada" para que cierre el accordion
    cajaComentario.value.ClearEditor();

    comentarioRefs.value[comentario.id].ResaltarComentario();
}

const handleUserCancelComment = () => {
    console.log('User canceled comment')
    emit('userPosted'); // lo vuelvo a emitir a "Entrada" para que cierre el accordion
}

const EliminarComentario = (id) => {
    comentariosLocal.value = comentariosLocal.value.filter(comentario => comentario.id != id)
}

defineExpose({ ToggleNewComment, HideCommentbox, comentarios: comentariosLocal, showCommentBox: showCommentBoxLocal, hasNextPage: hasNextPageLocal })
</script>