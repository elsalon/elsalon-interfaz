<template>
    <template v-for="seccion in props.salon.secciones" :key="seccion.id">
        
            <template v-if="seccion.relationTo=='linksExternos'">
                <div class="group">
                    <Button as="a" target="_blank" :href="seccion.value.url" :label="seccion.value.label" severity="contrast" size="small" class="group-hover:bg-gray-200" text />
                    <button class="text-zinc-400 hover:text-zinc-950 p-1"><i class="pi pi-pencil" style="font-size: .7rem;"/></button>
                </div>
            </template>
        
    </template>
    
</template>

<script setup>
const props = defineProps({
    salon: {
        type: Object,
        required: true
    }
})
</script>