<template>
    <div v-for="archivo in archivos" :key="archivo.id" class="group text-sm py-2 mb-1 font-mono listaArchivos flex items items-center">
        <i class="pi pi-paperclip mr-2 self-center text-zinc-600" style="font-size: .7rem"></i>
        <a :href="archivo.archivo.url" target="_blank">{{ archivo.archivo.filename }}</a>
        <span class="text-zinc-600 md:opacity-0 group-hover:opacity-100 transition-opacity duration-100 text-xs ml-2 filesize">{{ formatBytes(archivo.archivo.filesize) }}</span>
    </div>
</template>

<script setup>
    import formatBytes from '~/composables/useBytesDisplay';
    
    const props = defineProps({
        archivos: { type: Array, default: [] } 
    })
</script>