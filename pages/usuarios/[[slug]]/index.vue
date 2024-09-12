<template>
    <NuxtLayout name="layout-contenido">        
        <div class="text-center">
            <AvatarSalon :usuario="usuario" size="xlarge" imagesize="large"/>
            <h1 class="text-3xl font-bold">{{ usuario.nombre }}</h1>
        </div>
        <div class="text-md my-5">{{ usuario.bio }}</div>

        <div class="text-center mb-5" v-if="estadoMostrarBtnColaborador>0">
            <Button v-if="estadoMostrarBtnColaborador==1" @click="IniciarColaboracion" :loading="estadoColaboradorLoading" label="Colaborar"/>
            <Button v-if="estadoMostrarBtnColaborador==2" @click="DetenerColaboracion" :loading="estadoColaboradorLoading" class="bg-white text-black" label="Dejar de colaborar"></Button>
        </div>
        
        <EditorEntrada v-if="userIsMe" />
        <ListaEntradas :endpointQuery="query" />
    </NuxtLayout>
</template>

<script setup>
const route = useRoute()
const slug = route.params?.slug
const {data} = useAuth()
const estadoMostrarBtnColaborador = ref(0) // 0 no se muestra nada, 1 se muestra colaborar, 2 se muestra dejar de colaborar
const estadoColaboradorLoading = ref(false)
const idColaboracion = ref(null)

// Fetch the user data based on the slug
const res = await useApi(`/api/users?where[slug][equals]=${slug}`)
if (res.docs.length === 0) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
    })
}
const usuario = ref(res.docs[0])
const userIsMe = ref(usuario.value.id == data.value?.user.id)
const query = ref(`where[autor][equals]=${usuario.value.id}`)

const IniciarColaboracion = async () =>{
    try{
        estadoColaboradorLoading.value = true;
        const res = await useApi('/api/colaboraciones', {autor: data.value.user.id, colaborador: usuario.value.id}, 'POST')
        estadoMostrarBtnColaborador.value = 2
    }catch(e){
        console.log(e)
    }finally{
        estadoColaboradorLoading.value = false;
    }
}

const DetenerColaboracion = async () =>{
    try{
        estadoColaboradorLoading.value = true;
        await useApi(`/api/colaboraciones/${idColaboracion.value}`, null, 'DELETE')
        estadoMostrarBtnColaborador.value = 1
    }catch(e){
        console.log(e)
    }finally{
        estadoColaboradorLoading.value = false;
    }
}


onMounted(async() => {    
    if(usuario.value.id != data.value?.user.id){
        console.log("***")
        // Check if the user is already collaborating
        const resColaboracion = await useApi(`/api/colaboraciones?where[autor][equals]=${data.value.user.id}&where[colaborador][equals]=${usuario.value.id}`)
        if(resColaboracion.docs.length > 0){
            idColaboracion.value = resColaboracion.docs[0].id
            estadoMostrarBtnColaborador.value = 2
        }else{
            estadoMostrarBtnColaborador.value = 1
        }
    }
})

</script>