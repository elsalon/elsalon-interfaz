<template>
    <div>
        <DeferredContent @load="onComentarioScrolled">
            <button v-if="quedanMasComentarios && !fetchingComentarios" class="w-full my-1 text-gray-400 hover:text-gray-800 p-1 text-sm" @click="fetchComentarios">
                Cargar anteriores ({{ comentariosRestantes }})
            </button>
            <div v-if="fetchingComentarios" class="my-1 w-full text-center text-gray-500 p-1 text-sm">Cargando comentarios...</div>

            <Comentario v-for="comentario in comentarios" :comentario="comentario" :key="comentario.id"  @eliminar="EliminarComentario(comentario.id)" />
            
            <Accordion :value="showCommentBox">
                <AccordionPanel value="1">
                    <AccordionContent>
                    <CajaComentario v-if="showCommentBox=='1'"  :entradaId="entradaId" @userPosted="handleUserPostedComment" :key="cajaComentarioKey" ref="cajaComentario"/>
                </AccordionContent>
            </AccordionPanel>
        </Accordion>
        </DeferredContent>
    </div>
  </template>
  
  <script setup>
    import CajaComentario from './CajaComentario.vue';
  
    const props = defineProps({
        entradaId: {
            type: String,
            required: true,
        },
        showCommentBox: {
            type: String,
            default: '0',
        },
    })
    const page = ref(1)
    const quedanMasComentarios = ref(false)
    const comentariosRestantes = ref(0)
    const comentarios = ref([])
    const newestCommentDate = ref(null)
    const cajaComentarioKey = ref(0)
    const fetchingComentarios = ref(true)
    const cajaComentario = ref(null)
    
    const emit = defineEmits(['userPosted'])
    
    const fetchComentarios = async () => {
        fetchingComentarios.value = true
        const res = await useApi(`/api/comentarios?where[entrada][equals]=${props.entradaId}&sort=-createdAt&limit=3&page=${page.value}`)
        var newComments = res.docs.filter(newComment => 
            !comentarios.value.some(existingComment => existingComment.id === newComment.id)
        )
        newComments = newComments.reverse()
        comentarios.value = [...newComments, ...comentarios.value]
        if(res.totalDocs > 0){
            quedanMasComentarios.value = res.totalDocs > comentarios.value.length
            comentariosRestantes.value = res.totalDocs - comentarios.value.length
            page.value++
        }
        
        if (comentarios.value.length > 0 && !newestCommentDate.value) {
            newestCommentDate.value = comentarios.value[0].createdAt
        }
        fetchingComentarios.value = false
    }
    
    const fetchNewerComments = async () => {
        // Si no hay comentarios, fetch el primer set de comentarios
        if (!newestCommentDate.value) {
            await fetchComentarios()
            return
        }
        fetchingComentarios.value = true
        const res = await useApi(`/api/comentarios?where[entrada][equals]=${props.entradaId}&where[createdAt][greater_than]=${newestCommentDate.value}&sort=createdAt`)
        const newComments = res.docs.filter(newComment => 
        !comentarios.value.some(existingComment => existingComment.id === newComment.id)
        )
        comentarios.value = [...comentarios.value, ...newComments]
        
        if (newComments.length > 0) {
            newestCommentDate.value = newComments[0].createdAt
        }
        fetchingComentarios.value = false
    }
    
    const handleUserPostedComment = async () => {
        console.log('User posted comment')
        await fetchNewerComments()
        // emit('userPosted'); // lo vuelvo a emitir a "Entrada" para que cierre el accordion
        cajaComentario.value.ClearEditor();
    }
    
    const onComentarioScrolled = () => {
        fetchComentarios()
    }
    const EliminarComentario = (id) => {
        comentarios.value = comentarios.value.filter(comentario => comentario.id != id)  
    }
    </script>