<template>    
    <article>
        <div class="flex items-center mb-2">
            <!-- <div class="relative">
                <img class="h-10 w-10 object-cover rounded" src="https://randomuser.me/api/portraits/women/87.jpg" alt="Avatar">
                <div class="absolute inset-0 rounded"></div>
            </div> -->
            <AvatarSalon :usuario="entrada.autor" />
            <div class="ml-4">
                <h2 class="font-bold text-gray-800">{{ entrada.autor.nombre }}</h2>
                <div class="flex">
                    <a class="text-sm mr-2" href="#">PAV2</a>
                    <p class="text-gray-400 text-sm">{{ fechaFormateada }}</p>
                </div>
            </div>
        </div>
        
        <div class="prose prose-sm prose-headings:my-1 sm:pl-[55px]" v-html="entrada.contenido"></div>
        
    </article>
</template>

<script setup>
import Avatar from 'primevue/avatar';

    const props = defineProps({
    entrada: {
        type: Object,
        required: true,
    },
    });
    const { entrada } = props;

    const datetime = new Date(entrada.createdAt);
    const fechaFormateada = datetime.toLocaleDateString('es-ES', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
</script>