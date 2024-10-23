<template>
	<NuxtLayout name="layout-credenciales">
		<template #cta>Olvidé mi contraseña</template>

		<form @submit.prevent="handleForgot" class="space-y-3">
      		
			<div>
				<label for="email" class="block text-900 font-medium mb-2">Email</label>
				<InputText id="email" type="text" class="block w-full" v-model="email" required />
			</div>
  
			<div>
				<Button type="submit" label="Recuperar contraseña" class="block w-full mt-3" :loading="loading"></Button>
			</div>
		</form>
  
		<p class="mt-10 text-center text-sm text-gray-500">También podés
			<a href="/login" class="font-semibold leading-6 text-surface-600 hover:text-surface-500">iniciar sesión</a>
            o también 
            <a href="/registrar" class="font-semibold leading-6 text-surface-600 hover:text-surface-500">registrarte</a>
  		</p>

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
  title: 'Olvidé - Salón',
})

const email = ref('')
const loading = ref(false)
const runtimeConfig = useRuntimeConfig().public;
const toast = useToast();

const handleForgot = async () => {
    loading.value = true
    console.log('Olvide contraseña')
    const res = await $fetch(runtimeConfig.apiBase + '/api/users/forgot-password', {
        method: 'POST',
        body: JSON.stringify({email: email.value})
    })
    console.log(res)
    loading.value = false
    toast.add({ severity: 'contrast', summary: 'Listo', detail: 'Se ha enviado un email con instrucciones para recuperar tu contraseña', life: 6000});
}

</script>