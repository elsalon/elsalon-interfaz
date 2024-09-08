<template>

    
    <article>

        <div class="flex items-center">
            <div class="relative">
                <img class="h-10 w-10 object-cover rounded" src="https://randomuser.me/api/portraits/women/87.jpg" alt="Avatar">
                <div class="absolute inset-0 rounded"></div>
            </div>
            <div class="ml-4">
                <h2 class="font-bold text-gray-800">Jane Doe</h2>
                <p class="text-gray-600 text-sm">Software Engineer</p>
            </div>
        </div>
        
        <div class="prose lg:prose-lg prose-headings:my-1 pl-[55px]" v-html="entrada.contenido"></div>
        
    </article>
</template>

<script setup>
    const props = defineProps({
    entrada: {
        type: Object,
        required: true,
    },
    });
    const { entrada } = props;
</script>