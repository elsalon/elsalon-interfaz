<template>
    <NuxtLayout name="layout-contenido">        
        <EditorEntrada v-if="userIsMe" />
        <ListaEntradas :endpointQuery="query" />
    </NuxtLayout>
</template>

<script setup>
// import { ref, watchEffect, useRoute } from 'vue'

const route = useRoute()
const slug = route.params?.slug

// Use the authentication hook without ref
const {data} = useAuth()
// const userIsMe = ref(false)


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