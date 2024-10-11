<template>
    <NuxtLayout name="layout-contenido">        
        <div class="text-center">
            <AvatarSalon :usuario="grupo" size="xlarge" imagesize="large"/>
            <h1 class="text-3xl font-bold">{{ grupo.nombre }}</h1>
        </div>
        <!-- <div class="text-md my-5">{{ usuario.bio }}</div> -->

        <!-- <div class="text-center mb-5" v-if="estadoMostrarBtnColaborador>0">
            <Button v-if="estadoMostrarBtnColaborador==1" @click="IniciarColaboracion" :loading="estadoColaboradorLoading" label="Colaborar"/>
            <Button v-if="estadoMostrarBtnColaborador==2" @click="DetenerColaboracion" :loading="estadoColaboradorLoading" class="bg-white text-black" label="Dejar de colaborar"></Button>
        </div> -->
        
        <!-- <CrearEntradaBtn v-if="userIsMe" /> -->
        <!-- <div class="mt-10"></div> -->
         <!-- Group Members -->
        <div class="my-4">
            <div class="flex flex-wrap justify-center gap-4">
            <div v-for="usuario in grupo.integrantes" :key="usuario.id" class="flex items-center gap-x-2">
                <AvatarSalon :usuario="usuario" class="w-8 h-8" />
                <span class="text-sm text-gray-700">{{ usuario.nombre }}</span>
            </div>
            </div>
        </div>


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
// const userIsMe = ref(usuario.value.id == data.value?.user.id)
const query = ref(`where[grupo][equals]=${grupo.value.id}`)

// const IniciarColaboracion = async () =>{
//     try{
//         estadoColaboradorLoading.value = true;
//         const res = await useApi('/api/colaboraciones', {autor: data.value.user.id, colaborador: usuario.value.id}, 'POST')
//         estadoMostrarBtnColaborador.value = 2
//     }catch(e){
//         console.log(e)
//     }finally{
//         estadoColaboradorLoading.value = false;
//     }
// }

// const DetenerColaboracion = async () =>{
//     try{
//         estadoColaboradorLoading.value = true;
//         await useApi(`/api/colaboraciones/${idColaboracion.value}`, null, 'DELETE')
//         estadoMostrarBtnColaborador.value = 1
//     }catch(e){
//         console.log(e)
//     }finally{
//         estadoColaboradorLoading.value = false;
//     }
// }


onMounted(async() => {    
    // if(usuario.value.id != data.value?.user.id){
    //     // Check if the user is already collaborating
    //     const resColaboracion = await useApi(`/api/colaboraciones?where[autor][equals]=${data.value.user.id}&where[colaborador][equals]=${usuario.value.id}`)
    //     if(resColaboracion.docs.length > 0){
    //         idColaboracion.value = resColaboracion.docs[0].id
    //         estadoMostrarBtnColaborador.value = 2
    //     }else{
    //         estadoMostrarBtnColaborador.value = 1
    //     }
    // }
})

</script>