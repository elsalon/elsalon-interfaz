<template>
  <NuxtLayout name="layout-credenciales">
    <form @submit.prevent="handleSubmit" class="space-y-3">
      <div>
        <label for="email" class="block text-900 font-medium mb-2">Email</label>
        <InputText id="email" type="email" fluid v-model="email" required autofocus tabindex="1"/>
      </div>
  
      <div>
      <div class="flex items-center justify-between">
        <label for="password" class="block text-900 font-medium mb-2">Password</label>
        <div class="text-sm">
          <a href="/olvide" class="font-semibold text-surface-300 hover:text-surface-500" tabindex="5">¿Olvidaste tu contraseña?</a>
        </div>
      </div>
      <Password v-model="password" inputProps="" fluid toggleMask :input-props="{ tabindex: 2 }" :feedback="false" />
    </div>
      
        <div>
          <Button type="submit" label="Ingresar" class="block w-full mt-3" :loading="loading" tabindex="3"></Button>
        </div>
      </form>
  
      <p class="mt-10 text-center text-sm text-gray-500">
        ¿No tenés usuario?
        <a href="/registrar" class="font-semibold leading-6 text-surface-600 hover:text-surface-500" tabindex="4">Registrate</a>
      </p>
  </NuxtLayout>
 
</template>

<script setup>
definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/'
  },
})
useHead({
  title: 'Ingresar - Salón',
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
    loading.value = false
  }
}
</script>