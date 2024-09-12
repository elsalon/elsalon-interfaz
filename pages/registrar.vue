<template>
  <div class="flex container min-h-screen flex-col justify-center px-6 py-12 lg:px-8">

    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <img class="mx-auto w-auto" src="/public/salon_logo_lg_600x80.png" alt="El Salon">
      <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Darse de alta</h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form @submit.prevent="handleSignup" class="space-y-3">

          <div>
            <label for="nombre" class="block text-900 font-medium mb-2">Nombre</label>
            <InputText id="nombre" type="text" class="block w-full" v-model="nombre" required minlength="3"/>
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
    </div>
  </div>
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