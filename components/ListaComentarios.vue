<template>
    <div>
        <DeferredContent @load="onComentarioScrolled">
            <div v-if="fetchingComentarios" class="my-4 text-center text-gray-500 text-sm">Cargando comentarios...</div>
            <Comentario v-for="comentario in comentarios" :comentario="comentario" :key="comentario.id" />
            <button v-if="quedanMasComentarios" @click="fetchComentarios">Cargar más comentarios</button>
            
            <Accordion :value="showCommentBox">
                <AccordionPanel value="1">
                    <AccordionContent>
                    <CajaComentario :entradaId="entradaId" @userPosted="handleUserPostedComment" :key="cajaComentarioKey"/>
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
    const comentarios = ref([])
    const newestCommentDate = ref(null)
    const cajaComentarioKey = ref(0)
    const fetchingComentarios = ref(true)
    const emit = defineEmits(['userPosted'])
    
    const fetchComentarios = async () => {
        const res = await useApi(`/api/comentarios?where[entrada][equals]=${props.entradaId}&sort=createdAt&limit=5&page=${page.value}`)
        const newComments = res.docs.filter(newComment => 
            !comentarios.value.some(existingComment => existingComment.id === newComment.id)
        )
        comentarios.value = [...comentarios.value, ...newComments]
        quedanMasComentarios.value = res.totalDocs > comentarios.value.length
        page.value++
        
        if (comentarios.value.length > 0 && !newestCommentDate.value) {
            newestCommentDate.value = comentarios.value[0].createdAt
        }
        fetchingComentarios.value = false
    }
    
    const fetchNewerComments = async () => {
        if (!newestCommentDate.value) return
    
        const res = await useApi(`/api/comentarios?where[entrada][equals]=${props.entradaId}&where[createdAt][greater_than]=${newestCommentDate.value}&sort=createdAt`)
        const newComments = res.docs.filter(newComment => 
        !comentarios.value.some(existingComment => existingComment.id === newComment.id)
        )
        comentarios.value = [...comentarios.value, ...newComments]
        
        if (newComments.length > 0) {
        newestCommentDate.value = newComments[0].createdAt
        }
    }
    
    const handleUserPostedComment = async () => {
        console.log('User posted comment')
        await fetchNewerComments()
        emit('userPosted'); // lo vuelvo a emitir a "Entrada" para que cierre el accordion
        cajaComentarioKey.value++; // Fuerzo reiniciar el componente CajaComentario
    }
    
    const onComentarioScrolled = () => {
        fetchComentarios()
    }
    </script>