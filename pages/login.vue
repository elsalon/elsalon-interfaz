<template>
  <NuxtLayout name="layout-credenciales">


    <form @submit.prevent="handleSubmit" class="space-y-3">
      <div>
        <label for="email" class="block mb-2">Email</label>
        <InputText id="email" type="email" fluid v-model="email" required autofocus tabindex="1" />
      </div>

      <div>
        <div class="flex items-center justify-between">
          <label for="password" class="block text-900 mb-2">Password</label>
          <div class="text-sm">
            <a href="/olvide" class=" text-zinc-600 hover:text-zinc-900" tabindex="5">¿Olvidaste tu contraseña?</a>
          </div>
        </div>
        <Password v-model="password" inputProps="" fluid toggleMask :input-props="{ tabindex: 2 }" :feedback="false"
          required />
      </div>

      <!-- <Message v-if="mostrarAvisoRecuperar" severity="secondary" class="my-4 bg-white">Si ya tenías una cuenta en
        elsalon.org tenés que <a href="/olvide" class="link">recuperar tu contraseña</a></Message> -->

      <div>
        <Button type="submit" label="Ingresar" class="block" :loading="loading" fluid iconPos="right"
          tabindex="3"></Button>
      </div>
    </form>

    <p class="mt-10 text-center text-sm text-zinc-600">
      ¿No tenés usuario?
      <a href="/registrar" class="font-semibold leading-6 text-zinc-600 hover:text-zinc-900" tabindex="4">Registrate</a>
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
const mostrarAvisoRecuperar = ref(false)
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
    toast.add({ severity: 'error', summary: 'Error', detail: 'Usuario o contraseña incorrectas', life: 3000 });
    loading.value = false
  }
}

onMounted(() => {
  mostrarAvisoRecuperar.value = location.origin == 'https://elsalon.org'
})
</script>