<template>
    <NuxtLayout name="layout-contenido">        
        <div class="text-center">
            <AvatarSalon :usuario="usuario" size="xlarge" imagesize="large"/>
            <h1 class="text-3xl font-bold">{{ usuario.nombre }}</h1>
        </div>
        <div class="text-md my-5">{{ usuario.bio }}</div>

        <BtnColaborar v-if="!userIsMe"/>
        
        <CrearEntradaBtn v-if="userIsMe" />
        <ListaEntradas :endpointQuery="query" />
    </NuxtLayout>
</template>

<script setup>
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
useSalonStore().setContext('bitacora', usuario.value.id)
const userIsMe = ref(usuario.value.id == authData.value?.user.id)
const query = ref(`where[autor][equals]=${usuario.value.id}&where[autoriaGrupal][not_equals]=true`) // posts del usuario que no sean grupales

</script>