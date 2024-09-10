<template>
  <div class="container mx-auto">
    <div class="surface-card p-4">
      <div class="text-center mb-5">
        <img src="/public/salon_logo_lg_600x80.png" alt="Image" height="50" class="" />
        <!-- <div class="text-900 text-3xl font-medium mb-3">Welcome Back</div>
        <span class="text-600 font-medium line-height-3">Don't have an account?</span> -->
        <!-- <a class="font-medium no-underline ml-2 text-blue-500 cursor-pointer">Create today!</a> -->
      </div>

      <form @submit.prevent="handleSubmit">
        <label for="email1" class="block text-900 font-medium mb-2">Email</label>
        <InputText id="email" type="text" class="w-full md:w-auto mb-3" v-model="email" required />

        <label for="password1" class="block text-900 font-medium mb-2">Password</label>
        <InputText id="password" type="password" class="w-full md:w-auto mb-3" v-model="password" required />

        <!-- <div class="flex align-items-center justify-content-between mb-6">
            <div class="flex align-items-center">
                <Checkbox id="rememberme1" :binary="true" v-model="checked" class="mr-2"></Checkbox>
                <label for="rememberme1">Remember me</label>
            </div>
            <a class="font-medium no-underline ml-2 text-blue-500 text-right cursor-pointer">Forgot password?</a>
        </div> -->
        <div>
          <Button type="submit" label="Ingresar" class="w-full md:w-auto mb-3" :loading="loading"></Button>
        </div>
      </form>
    </div>


  </div>
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