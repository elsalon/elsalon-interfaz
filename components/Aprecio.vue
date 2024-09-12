<template>
    <Button link class="text-sm text-surface-500" style="padding: 0" label="Aprecio (6)" v-tooltip.top="'Hola'"/>
</template>

<script setup>
const props = defineProps({
    entradaId: {
        type: String,
        required: true,
    },
});

const { docs, totalDocs, haApreciado } = await useApi(`/api/apreciaciones/${props.entradaId}`);
console.log(docs, totalDocs, haApreciado )

</script>