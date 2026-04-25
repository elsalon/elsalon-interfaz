<template>
  <NuxtLayout name="layout-credenciales">
    <template #cta>
      <span v-if="!formSubmitted">Olvidé mi contraseña</span>
      <span v-else></span>
    </template>

    <div v-if="!formSubmitted">
      <form @submit.prevent="handleForgot" class="space-y-3">
        <div>
          <label for="email" class="block text-900 font-medium mb-2">Email</label>
          <InputText id="email" type="email" class="block w-full" v-model="email" required />
        </div>

        <div>
          <p class="text-xs text-center text-zinc-600 dark:text-zinc-400 mt-5">Al recuperar te llegará un mail con un link para activar tu cuenta</p>
          <Button type="submit" label="Recuperar contraseña" class="block mt-3" :loading="loading"  fluid iconPos="right"></Button>
        </div>
      </form>

      <p class="mt-10 text-center text-sm text-zinc-600 dark:text-zinc-400">También podés
        <a href="/login" class="font-semibold leading-6 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200">iniciar sesión</a>
        o
        <a href="/registrar" class="font-semibold leading-6 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200">registrarte</a>
      </p>
    </div>

    <div v-else class="text-center py-8">
      <p class="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-4">¡Correo enviado!</p>
      <p class="text-zinc-600 dark:text-zinc-400">Se ha enviado un email con instrucciones para recuperar tu contraseña.</p>
      <p class="mt-6">
        <a href="/login" class="font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200">Volver al inicio de sesión</a>
      </p>
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
useHead({
  title: 'Olvidé - Salón',
})

const email = ref('')
const loading = ref(false)
const formSubmitted = ref(false)
const runtimeConfig = useRuntimeConfig().public;
const toast = useToast();

const handleForgot = async () => {
  loading.value = true
  console.log('Olvide contraseña')
  const res = await $fetch(runtimeConfig.apiBase + '/api/users/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email: email.value })
  })
  console.log(res)
  loading.value = false
  formSubmitted.value = true
  toast.add({ severity: 'contrast', summary: 'Listo', detail: 'Se ha enviado un email con instrucciones para recuperar tu contraseña', life: 6000 });
}
</script>