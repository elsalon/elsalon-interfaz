<template>
    <div v-for="archivo in archivos" :key="archivo.id" class="text-sm py-2 mb-1 font-mono listaArchivos flex items items-center">
        <!-- <i class="pi pi-file mr-2 self-center" style="font-size: .7rem"></i> -->
        <a :href="archivo.archivo.url" target="_blank">{{ archivo.archivo.filename }}</a>
        <span class="text-neutral-300 text-xs ml-2 filesize">{{ formatBytes(archivo.archivo.filesize) }}</span>
    </div>
</template>

<script setup>
    import formatBytes from '~/composables/useBytesDisplay';
    
    const props = defineProps({
        archivos: { type: Array, default: [] } 
    })
</script>