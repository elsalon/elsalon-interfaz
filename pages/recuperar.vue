<template>
	<NuxtLayout name="layout-credenciales">
		<template #cta>Recuperar contraseña</template>

		<form @submit.prevent="handleRecuperar" class="space-y-3">
      		
			<div>
                <label for="password" class="block text-900 font-medium mb-2">Nueva Contraseña</label>
                <Password v-model="password" id="password" inputProps="" fluid toggleMask :feedback="false" tabindex="1" />
            </div>

            <div>
                <label for="password2" class="block text-900 font-medium mb-2">Repetí Contraseña</label>
                <Password v-model="password2" id="password2" inputProps="" fluid :feedback="false" tabindex="2" />
            </div>
  
			<div>
				<Button type="submit" label="Cambiar contraseña" class="block w-full mt-3" :loading="loading"></Button>
			</div>
		</form>
  </NuxtLayout>
</template>
  
<script setup>
// Permito que se pueda acceder a la página sin autenticación
definePageMeta({
    auth: {
      unauthenticatedOnly: true,
      navigateAuthenticatedTo: '/'
    }
})
useHead({
  title: 'Recuperar - Salón',
})

const password = ref('')
const password2 = ref('')
const route = useRoute()
const router = useRouter()
const token = route.query?.t
const loading = ref(false)
const runtimeConfig = useRuntimeConfig().public;
const toast = useToast();

const handleRecuperar = async () => {
    if(!token || token == ''){
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se puede recuperar usuario. Revisá las instrucciones del mail.', life: 3000});
        return
    }
    if(password.value != password2.value){
        toast.add({ severity: 'error', summary: 'Error', detail: 'Las contraseñas no coinciden', life: 3000});
        return
    }

    loading.value = true
    console.log('Recuperar contraseña')
    try{

        const res = await $fetch(runtimeConfig.apiBase + '/api/users/reset-password', {
            method: 'POST',
            body: JSON.stringify({token, password: password.value})
        })
        console.log(res)
        loading.value = false
        toast.add({ severity: 'contrast', summary: 'Listo', detail: 'Tu contraseña se cambió correctamente. Serás redirijido', life: 2000});
        setTimeout(() => {
            router.push('/login')
        }, 2000);
    }catch(e){
        console.error(e)
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar la contraseña. Revisá las instrucciones del mail.', life: 3000});
        loading.value = false
    }

}

</script>