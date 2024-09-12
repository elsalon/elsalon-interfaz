<template>
    <div>
        <Comentario v-for="comentario in comentarios" :comentario="comentario" :key="comentario.id" />
    </div>
</template>


<script setup>
    const props = defineProps({
        entradaId: {
            type: String,
            required: true,
        },
    });
    const comentarios = ref([]);
    const res = await useApi(`/api/comentarios?where[entrada][equals]=${props.entradaId}`);
    
    comentarios.value = res.docs;

</script>