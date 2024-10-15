<template>
	<NuxtLayout name="layout-credenciales">
    <template v-if="!userSignedUp" #cta>Registrate en El Salón</template>
    <template v-if="!userSignedUp">
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
    </template>
    
    <div v-if="userSignedUp">
      <div class="text-center">
        <h2 class="text-2xl font-semibold">¡Bienvenido a El Salón!</h2>
        <p class="mt-4">Tu cuenta fue creada. Revisá tu correo y seguí las instrucciones para validarla.</p>
      </div>
    </div>
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

const userSignedUp = ref(false)

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
    await signUp(credentials, undefined, { preventLoginFlow: true })
    userSignedUp.value = true
    
  } catch (error) {
    console.error('Signup failed:', error)
    toast.add({ severity: 'contrast', summary: 'Error', detail: 'No se pudo dar de alta', life: 3000});
  } finally {
    loading.value = false
  }
}
</script>