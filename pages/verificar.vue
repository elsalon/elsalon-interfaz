<template>
	Verificando usuario
</template>
  
<script setup>
// Permito que se pueda acceder a la página sin autenticación
definePageMeta({
    auth: {
      unauthenticatedOnly: true,
      navigateAuthenticatedTo: '/'
    }
})

const route = useRoute()
const router = useRouter()
const token = route.query?.t
const loading = ref(false)
const runtimeConfig = useRuntimeConfig().public;
const toast = useToast();

// Verificar
const handleVerificar = async () => {
    if(!token || token == ''){
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se puede verificar usuario. Revisá las instrucciones del mail.', life: 3000});
        return
    }

    loading.value = true
    console.log('Verificar usuario')
    try{

        const res = await $fetch(`${runtimeConfig.apiBase}/api/users/verify/${token}`, {
            method: 'POST',
            body: JSON.stringify({token})
        })
        console.log(res)
        loading.value = false
        toast.add({ severity: 'contrast', summary: 'Listo', detail: 'Tu usuario se verificó correctamente. Serás redirijido', life: 2000});
        setTimeout(() => {
            router.push('/login')
        }, 2000);
    }catch(e){
        console.error(e)
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo verificar el usuario. Revisá las instrucciones del mail.', life: 3000});
        loading.value = false
    }

}

onMounted(async () => {
    handleVerificar()
})
</script>