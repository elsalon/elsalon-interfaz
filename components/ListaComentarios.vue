<template>
    <div>
        <div class="w-full text-center">
            <Button v-if="hasNextPage && !fetchingComentarios" link class="my-2 !text-zinc-600 text-xs"
                @click="fetchComentarios" :label="`Ver más comentarios (${comentariosRestantes})`"/>
        </div>

        <div v-if="fetchingComentarios" class="my-2 w-full text-center text-zinc-600 text-sm">
            <span class="texto-cargando">
                Cargando comentarios...
            </span>
        </div>

        <div class="pl-0 pt-2 border-l-1 border-zinc-100 relative">
            <Comentario v-for="(comentario, index) in comentarios" :comentario="comentario" :key="comentario.id"
                @eliminar="EliminarComentario(comentario.id)" @toggleCommentBox="ToggleNewComment"
                :ref="(el) => setComentarioRef(el, comentario.id)" :isLast="index === comentarios.length - 1" />

            <Button v-show="comentarios.length>0" link class="mr-2 text-xs text-zinc-600 leading-normal !p-0" :class="{'opacity-0 pointer-events-none':showCommentBox === '1'}" label="Comentar"
                @click="ToggleNewComment" />

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
import qs from 'qs';
import CajaComentario from './CajaComentario.vue';

const props = defineProps({
    entradaId: {
        type: String,
        required: true,
    },
    // showCommentBox: {
    //     type: String,
    //     default: '0',
    // },
    comentariosIniciales: {
        type: Object,
        required: true,
    }
})
const hasNextPage = ref(false)
const comentariosRestantes = ref(0)
const comentarios = ref([])
// computed property newestCommentDate
const newestCommentDate = computed(() => comentarios.value.length > 0 ? comentarios.value[comentarios.value.length - 1].createdAt : null)
const oldestCommentDate = computed(() => comentarios.value.length > 0 ? comentarios.value[0].createdAt : null)

const showCommentBox = ref("0")

const cajaComentarioKey = ref(0)
const fetchingComentarios = ref(false)
const cajaComentario = ref(null)

const emit = defineEmits(['userPosted'])

const ToggleNewComment = () => {
    showCommentBox.value = showCommentBox.value == '0' ? '1' : '0';
}
const HideCommentbox = () => {
    showCommentBox.value = '0';
}

comentarios.value = props.comentariosIniciales.docs;
hasNextPage.value = props.comentariosIniciales.hasNextPage;
comentariosRestantes.value = props.comentariosIniciales.totalDocs - comentarios.value.length

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
        !comentarios.value.some(existingComment => existingComment.id === newComment.id)
    )
    newComments = newComments.reverse()
    comentarios.value = [...newComments, ...comentarios.value]
    hasNextPage.value = res.hasNextPage;
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
    const newComments = res.docs.filter(newComment => !comentarios.value.some(existingComment => existingComment.id === newComment.id))
    comentarios.value = [...comentarios.value, ...newComments]

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
    comentarios.value = comentarios.value.filter(comentario => comentario.id != id)
}

defineExpose({ ToggleNewComment, HideCommentbox, comentarios })
</script>