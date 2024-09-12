<template>
  <NuxtLayout name="layout-credenciales">
    <form @submit.prevent="handleSubmit" class="space-y-3">
      <div>
        <label for="email" class="block text-900 font-medium mb-2">Email</label>
        <InputText id="email" type="text" class="block w-full" v-model="email" required />
      </div>
  
      <div>
      <div class="flex items-center justify-between">
        <label for="password1" class="block text-900 font-medium mb-2">Password</label>
        <div class="text-sm">
          <a href="#" class="font-semibold text-surface-300 hover:text-surface-500">¿Olvidaste tu contraseña?</a>
        </div>
      </div>
      <InputText id="password" type="password" class="block w-full" v-model="password" required />
    </div>
      
        <div>
          <Button type="submit" label="Ingresar" class="block w-full mt-3" :loading="loading"></Button>
        </div>
      </form>
  
      <p class="mt-10 text-center text-sm text-gray-500">
        ¿No tenés usuario?
        <a href="/registrar" class="font-semibold leading-6 text-surface-600 hover:text-surface-500">Registrate</a>
      </p>
  </NuxtLayout>
 
</template>

<script setup>
definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/'
  }
})
import { ref } from 'vue'
import { useAuth } from '#imports'
const toast = useToast();
import { useToast } from "primevue/usetoast";

const email = ref('')
const password = ref('')
const loading = ref(false)
const { signIn } = useAuth()

const handleSubmit = async () => {
  loading.value = true
  try {
    await signIn({
      email: email.value,
      password: password.value
    }, {
      callbackUrl: '/'
    })
  } catch (error) {
    console.error('Login failed:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Usuario o contraseña incorrectas', life: 3000});
  } finally{
    loading.value = false
  }
}
</script>