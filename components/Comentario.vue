<template>
    <Panel toggleable class="border-surface-0 background-red text-sm">
        <template #header>
            <div class="flex items-center gap-2">
                <AvatarSalon :usuario="comentario.autor" size="small" />
                <span class="font-bold">{{ comentario.autor.nombre }}</span>
            </div>
        </template>
        
        <template #icons>
            <Button icon="pi pi-cog" severity="secondary" rounded text />
            
        </template>
        <DeferredContent @load="onEntradaScrolled">
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
</script>