<template>
    <Button class="text-xs  leading-normal !p-1 self-center bg-zinc-200 border-zinc-200 text-zinc-500
        hover:bg-zinc-300 hover:border-zinc-300 hover:text-zinc-600"
        :label="labelCancelar ? 'Cancelar Comentario' : 'Comentar'"
        @click="ButtonClicked()" />
</template>
<script setup>

const props = defineProps({
    labelCancelar: Boolean,
})

const emit = defineEmits(['click'])
const ButtonClicked = () => {
    emit('click')
}
</script>