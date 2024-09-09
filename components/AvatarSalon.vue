<template>
    <Avatar v-if="tieneImagen" :image="avatarUrl" size="large" style="background-color: #fff"/>
    <Avatar v-else :label="iniciales" size="large" style="background-color: #000; color: #fff" />
</template>

<script setup>
    import { ref } from 'vue';
    import { useRuntimeConfig } from '#app';
    const runtimeConfig = useRuntimeConfig().public;

    const props = defineProps({
    usuario: {
        type: Object,
        required: true,
    },
    });
    const { usuario } = props;
    const iniciales = ref('');
    const avatarUrl = ref('');
    const tieneImagen = usuario?.avatar?.sizes?.thumbnail?.url ? true : false;

    if(tieneImagen){
        avatarUrl.value = runtimeConfig.apiBase + usuario.avatar.sizes.thumbnail.url;
        console.log('Avatar URL:', avatarUrl.value)
    }else{
        iniciales.value = usuario?.nombre.split(' ').map(n => n[0]).join('');
    }

</script>