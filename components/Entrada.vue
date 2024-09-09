<template>    
    <article>
        <div class="flex items-center mb-2">
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