<template>
    <div v-for="archivo in archivos" :key="archivo.id" class="text-sm bg-gray-50 text-gray-400 hover:text-gray-800 p-2 mb-1 font-mono">
        <a :href="baseUrl + archivo.archivo.url" target="_blank" class="flex items ">
            <i class="pi pi-file mr-2 self-center" style="font-size: .7rem"></i>
            <span class="grow">{{ archivo.archivo.filename }}</span>
            <span class="text-xs">{{ formatBytes(archivo.archivo.filesize) }}</span>
        </a>
    </div>
</template>

<script setup>
    import { useRuntimeConfig } from '#app';
    import formatBytes from '~/composables/useBytesDisplay';
    
    const baseUrl = useRuntimeConfig().public.apiBase;
    const props = defineProps({
        archivos: { type: Array, default: [] } 
    })
</script>