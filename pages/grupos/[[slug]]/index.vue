<template>
    <NuxtLayout name="layout-contenido">        
        <template #header>{{ grupo.nombre }}</template>  
        <div class="user-info mb-5">
            <div class="text-center mb-2">
                <AvatarSalon :usuario="grupo" size="xlarge" imagesize="large"/>
                <div v-if="tieneLink">
                    <a  class="link" :href="linkAbsoluta" target="_blank">{{ linkSimplificada }}</a>
                </div>
            </div>
            <div class="text-md">{{ grupo.desc }}</div>
        </div>
        
        <!-- Group Members -->
        <div class="my-4">
            <div class="flex flex-wrap justify-center gap-4">
                <NuxtLink v-for="usuario in grupo.integrantes" :to="`/usuarios/${usuario.slug}`" :key="usuario.id" class="flex items-center gap-x-2">
                    <AvatarSalon :usuario="usuario" class="w-8 h-8" />
                    <span class="text-sm text-gray-700">{{ usuario.nombre }}</span>
                </NuxtLink>
            </div>
        </div>
        
        <BtnColaborar v-if="!userIsInGroup"/>
        <CrearEntradaBtn v-if="userIsInGroup" />
        <ListaEntradas :endpointQuery="query" />
    </NuxtLayout>
</template>

<script setup>
const route = useRoute()
const slug = route.params?.slug
const {data: authData} = useAuth()

// Fetch the user data based on the slug
const res = await useAPI(`/api/grupos?where[slug][equals]=${slug}`)
if (res.docs.length === 0) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
    })
}
const grupo = ref(res.docs[0])

const salonStore = useSalonStore()
salonStore.setContext('grupo', grupo.value.id)
salonStore.SetPageTitle(grupo.value.nombre)

const userIsInGroup = ref(grupo.value.integrantes.some(i => i.id == authData.value?.user.id))
const query = ref(`where[grupo][equals]=${grupo.value.id}`)

const tieneLink = ref(grupo.value.link != null && grupo.value.link != '');
const linkSimplificada = ref(null);
const linkAbsoluta = ref(null);
if(tieneLink.value){
    linkSimplificada.value = grupo.value.link.replace(/(^\w+:|^)\/\//, '');
    linkAbsoluta.value = grupo.value.link.includes('http') ? grupo.value.link : `https://${grupo.value.link}`;
}


</script>