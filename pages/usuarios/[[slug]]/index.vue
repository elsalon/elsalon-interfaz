<template>
    <NuxtLayout name="layout-contenido">        
        <div class="text-center">
            <AvatarSalon :usuario="usuario" size="xlarge" imagesize="large" :class="{'cursor-zoom-in':usuario.avatar?.url}" @click="OpenAvatar"/>
            <h1 class="text-3xl font-bold">{{ usuario.nombre }}</h1>
        </div>
        <div class="text-md my-5">{{ usuario.bio }}</div>

        <BtnColaborar v-if="!userIsMe"/>
        
        <CrearEntradaBtn v-if="userIsMe" />
        <ListaEntradas :endpointQuery="query" />
    </NuxtLayout>
</template>

<script setup>
import PhotoSwipe from 'photoswipe';
import 'photoswipe/style.css';

const route = useRoute()
const slug = route.params?.slug
const {data: authData} = useAuth()

// Fetch the user data based on the slug
const res = await useApi(`/api/users?where[slug][equals]=${slug}`)
if (res.docs.length === 0) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
    })
}
const usuario = ref(res.docs[0])
const salonStore = useSalonStore()
salonStore.SetPageTitle(usuario.value.nombre)
salonStore.setContext('bitacora', usuario.value.id)
const userIsMe = ref(usuario.value.id == authData.value?.user.id)
const query = ref(`where[autor][equals]=${usuario.value.id}&where[autoriaGrupal][not_equals]=true`) // posts del usuario que no sean grupales

let galleryPswp = null;
let galleryOptions = null;

const OpenAvatar = () => {
    if(!usuario.value.avatar) return;

    if (galleryPswp) {
        galleryPswp.close();  // or use galleryPswp.destroy() depending on the version
    }

    const dataSource = [{    
        src: usuario.value.avatar.url,
        w:   usuario.value.avatar.width,
        h:   usuario.value.avatar.height,
    }]

    galleryOptions = {
        dataSource,
        showHideAnimationType: 'none',
        initialZoomLevel: 'fit',
        secondaryZoomLevel: 1.5,
        maxZoomLevel: 2,
    };
    galleryPswp = new PhotoSwipe(galleryOptions);
    galleryPswp.init();
}
</script>