<template>
    <Button class="text-xs !p-1 self-center bg-zinc-200 border-zinc-200 text-zinc-600
        hover:bg-zinc-300 hover:border-zinc-300"
        :label="labelCancelar ? 'Cancelar' : 'Comentar'"
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