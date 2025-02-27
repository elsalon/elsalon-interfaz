<template>
    <Avatar v-if="tieneImagen" :image="avatarUrl" :size="props.size" style="background-color: #fff" shape=""/>
    <Avatar v-else :label="iniciales" :size="props.size" :style="{'background-color': backgroundColor}" style="color: #fff" shape=""/>
</template>

<script setup>
    const props = defineProps({
        usuario: {
            type: Object,
            required: true,
        },
        size: {
            type: String,
            default: 'large',
        },
        imagesize: {
            type: String,
            default: 'thumbnail',
        },
        avatarType:{
            type: String,
            default: 'user', // (relationto) users, grupos, salas
        }
    });
    const { usuario } = props;
    const iniciales = ref('');
    const avatarUrl = ref('');
    const tieneImagen = usuario?.avatar?.sizes?.thumbnail?.url ? true : false;
    const backgroundColor = usuario?.color || '#000';

    if(tieneImagen){
        const imageUrl = props.imagesize == 'thumbnail' ? usuario.avatar.sizes.thumbnail.url : usuario.avatar.url
        avatarUrl.value = imageUrl;
    }else{
        if(props.avatarType == 'salas'){
            iniciales.value = usuario?.siglas;
        }else{
            iniciales.value = usuario?.nombre?.split(' ').map(n => n[0]).join('');
            iniciales.value = iniciales.value?.toUpperCase();
            // Max 3 iniciales
            iniciales.value = iniciales.value?.substring(0, 3);
        }
    }

</script>