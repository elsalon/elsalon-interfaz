<template>
    <!-- <DeferredContent @load="ContenidoCargado" -->
    <div v-html="contenidoRendereado" @click="onContenidoClicked"></div>
</template>

<script setup>
import PhotoSwipe from 'photoswipe';
import 'photoswipe/style.css';

const props = defineProps({
    contenido: {
        type: Object,
        required: true,
    },
});
let galleryPswp = null;
let galleryOptions = null;

const contenidoRendereado = ref(null);

const ReloadContent = async (entrada) => {
    console.log("ReloadContent", entrada)
    contenidoRendereado.value = useRenderSalonHtml(entrada)   
}

const onContenidoClicked = (event) => {
    if (event.target.tagName === 'IMG') {
        const imgSrc = event.target;
        handleImageClick(imgSrc);
    }
}

const handleImageClick = (imgSrc) => {
    if (galleryPswp) {
        galleryPswp.close();  // or use galleryPswp.destroy() depending on the version
    }
    galleryOptions.index = galleryOptions.dataSource.findIndex((img) => img.id === imgSrc.dataset.salonid);
    galleryPswp = new PhotoSwipe(galleryOptions);
    galleryPswp.init();
}

contenidoRendereado.value = useRenderSalonHtml(props.contenido);

onMounted(() => {
    
    if (props.contenido.imagenes.length == 0) return;
    const dataSource = props.contenido.imagenes.map(img => {
        return {
            src: img.imagen.url,
            w: img.imagen.width,
            h: img.imagen.height,
            id: img.imagen.id,
        }
    });

    galleryOptions = {
        dataSource,
        showHideAnimationType: 'none',
        initialZoomLevel: 'fit',
        secondaryZoomLevel: 1.5,
        maxZoomLevel: 4,
    };
    galleryOptions.index = 0; // defines start slide index        
});


defineExpose({
    ReloadContent,
    contenidoRendereado,
});


</script>