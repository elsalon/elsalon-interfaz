<template>
    <NuxtLayout name="layout-contenido">        
        <div class="text-center">
            <AvatarSalon :usuario="usuario" size="xlarge" imagesize="large"/>
            <h1 class="text-3xl font-bold">{{ usuario.nombre }}</h1>
        </div>
        <div class="text-md my-5">{{ usuario.bio }}</div>

        <div class="text-center mb-5">
            <Button>Seguir</Button>
            <Button class="bg-white text-black">Dejar de seguir</Button>
        </div>
        
        <EditorEntrada v-if="userIsMe" />
        <ListaEntradas :endpointQuery="query" />
    </NuxtLayout>
</template>

<script setup>
const route = useRoute()
const slug = route.params?.slug
const {data} = useAuth()

// Fetch the user data based on the slug
const res = await useApi(`/api/users?where[slug][equals]=${slug}`)
if (res.docs.length === 0) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
    })
}
const usuario = ref(res.docs[0])
const userIsMe = ref(usuario.value.id === data.value?.user.id)
const query = ref(`where[autor][equals]=${usuario.value.id}`)


</script>