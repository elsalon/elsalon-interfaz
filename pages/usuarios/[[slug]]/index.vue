<template>
    <NuxtLayout name="layout-contenido">    
        <template #header>{{ usuario.nombre }}</template>

        <div class="user-info mb-5">
            <div class="text-center mb-2">
                <AvatarSalon :usuario="usuario" size="xlarge" imagesize="large" :class="{'cursor-zoom-in':usuario.avatar?.url}" @click="OpenAvatar"/>
                <div v-if="tieneLink">
                    <a  class="link" :href="linkAbsoluta" target="_blank">{{ linkSimplificada }}</a>
                </div>
                <div v-if="usuario.mostrarEmail">
                    <a class="link" :href="'mailto:'+usuario.email">{{ usuario.email }}</a>
                </div>
            </div>
            <div class="text-md">{{ usuario.bio }}</div>
        </div>

        <!-- GRUPOS DEL USUARIO -->
        <div v-if="grupos.length" class="flex gap-3 mb-5 flex-wrap">
            <NuxtLink v-for="grupo in grupos" :to="`/grupos/${grupo.slug}`" :key="grupo.id" class="flex items-center">
                <AvatarSalon :usuario="grupo" class="w-8 h-8 mr-1" />
                <span class="text-sm text-gray-700">{{ grupo.nombre }}</span>
            </NuxtLink>
        </div>

        <BtnColaborar class="mb-5" v-if="!userIsMe"/>
        
        <CrearEntradaBtn v-if="userIsMe" />
        <ListaEntradas :query="query" :cacheKey="cacheKey"/>
    </NuxtLayout>
</template>

<script setup>
import PhotoSwipe from 'photoswipe';
import 'photoswipe/style.css';

const route = useRoute()
const slug = route.params?.slug
const auth = useAuth()

// Fetch the user data based on the slug
const res = await useAPI(`/api/users?where[slug][equals]=${slug}`)
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
const userIsMe = ref(usuario.value.id == auth.data.value?.user.id)
const query = {
    where: {
        and : [
            {
                autor: { equals : usuario.value.id }
            },
            {
                autoriaGrupal: { not_equals : true } 
            }
        ]
    }
}
const cacheKey = `bitacora-${usuario.value.id}`

const tieneLink = ref(usuario.value.link != null && usuario.value.link != '');
const linkSimplificada = ref(null);
const linkAbsoluta = ref(null);
if(tieneLink.value){
    linkSimplificada.value = usuario.value.link.replace(/(^\w+:|^)\/\//, '');
    linkAbsoluta.value = usuario.value.link.includes('http') ? usuario.value.link : `https://${usuario.value.link}`;
}


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

const grupos = ref([])
const resGrupos = await useAPI(`/api/grupos?where[integrantes][contains]=${usuario.value.id}`)
grupos.value = resGrupos.docs
</script>