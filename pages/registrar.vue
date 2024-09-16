<template>
	<NuxtLayout name="layout-credenciales">
		<template #cta>Darse de alta en El Salón</template>

		<form @submit.prevent="handleSignup" class="space-y-3">
      		<div>
				<label for="nombre" class="block text-900 font-medium mb-2">Nombre</label>
				<InputText id="nombre" type="text" class="block w-full" v-model="nombre" autofocus required minlength="3"/>
			</div>
      
			<div>
				<label for="email" class="block text-900 font-medium mb-2">Email</label>
				<InputText id="email" type="text" class="block w-full" v-model="email" required />
			</div>
  
			<div>
				<label for="password" class="block text-900 font-medium mb-2">Contraseña</label>
				<InputText id="password" type="password" class="block w-full" v-model="password" required />
			</div>  
    
			<div>
				<Button type="submit" label="Registrar" class="block w-full mt-3" :loading="loading"></Button>
			</div>
		</form>
  
		<p class="mt-10 text-center text-sm text-gray-500">¿Ya tenés usuario?
			<a href="/login" class="font-semibold leading-6 text-surface-600 hover:text-surface-500">Iniciá sesión</a>
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

import { ref } from 'vue'

const nombre = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const { signUp } = useAuth()

const toast = useToast();
import { useToast } from "primevue/usetoast";

const handleSignup = async () => {
  loading.value = true
  try {
    const credentials = { 
        email: email.value,
        password: password.value,
        nombre: nombre.value,
    }
    await signUp(credentials,{
        callbackUrl: '/',
        redirect: true,
    })
  } catch (error) {
    console.error('Signup failed:', error)
    toast.add({ severity: 'contrast', summary: 'Error', detail: 'No se pudo dar de alta', life: 3000});
  } finally {
    loading.value = false
  }
}
</script>