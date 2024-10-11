<template>
    <NuxtLayout name="layout-contenido">        
        <div class="text-center">
            <AvatarSalon :usuario="grupo" size="xlarge" imagesize="large"/>
            <h1 class="text-3xl font-bold">{{ grupo.nombre }}</h1>
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
        
        <ListaEntradas :endpointQuery="query" />
    </NuxtLayout>
</template>

<script setup>
const route = useRoute()
const slug = route.params?.slug
const {data: authData} = useAuth()

// Fetch the user data based on the slug
const res = await useApi(`/api/grupos?where[slug][equals]=${slug}`)
if (res.docs.length === 0) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
    })
}
const grupo = ref(res.docs[0])
const elsalon = useSalonStore();
elsalon.setContext('grupo', grupo.value.id)
const userIsInGroup = ref(grupo.value.integrantes.some(i => i.id == authData.value?.user.id))
const query = ref(`where[grupo][equals]=${grupo.value.id}`)

</script>