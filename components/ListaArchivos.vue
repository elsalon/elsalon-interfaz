<template>
    <div v-for="archivo in archivos" :key="archivo.id" class="text-sm  text-gray-400 hover:text-gray-800 py-2 mb-1 font-mono">
        <a :href="archivo.archivo.url" target="_blank" class="flex items items-center">
            <i class="pi pi-file mr-2 self-center" style="font-size: .7rem"></i>
            <span class="">{{ archivo.archivo.filename }}</span>
            <span class="text-gray-300 text-xs ml-2">{{ formatBytes(archivo.archivo.filesize) }}</span>
        </a>
    </div>
</template>

<script setup>
    import formatBytes from '~/composables/useBytesDisplay';
    
    const props = defineProps({
        archivos: { type: Array, default: [] } 
    })
</script>