<template>
	<NuxtLayout name="layout-credenciales">
    <template #cta>
      <span v-if="!userSignedUp">Registrate</span>
      <span v-else></span>
    </template>
    <template v-if="!userSignedUp">
      <form @submit.prevent="handleSignup" class="space-y-3">
        <div>
          <label for="nombre" class="block text-900 font-medium mb-2">Nombre y Apellido</label>
          <InputText id="nombre" type="text" class="block w-full" v-model="nombre" autofocus required minlength="3"/>
        </div>
        
        <div>
          <label for="email" class="block text-900 font-medium mb-2">Email</label>
          <InputText id="email" type="email" class="block w-full" v-model="email" required />
        </div>
    
        <div>
          <label for="password" class="block text-900 font-medium mb-2">Contraseña</label>
          <Password v-model="password" id="password" inputProps="" fluid toggleMask :feedback="false" />
        </div>  

        <div>
          <label for="confirmPassword" class="block text-900 font-medium mb-2">Confirmar Contraseña</label>
          <Password 
            id="confirmPassword" 
            type="password" 
            class="block w-full" 
            v-model="confirmPassword"
            :class="{'p-invalid': passwordError}"
            required 
            :feedback="false"
            fluid
          />
          <div class="h-4">
            <small class="p-error" v-if="passwordError">Las contraseñas no coinciden</small>
          </div>
        </div>
      
        <div>
          
          <Button type="submit" label="Registrar" class="block mt-3" :loading="loading" :disabled="!isFormValid" fluid iconPos="right"/>
        </div>
      </form>
      
      <p class="mt-10 text-center text-sm text-zinc-600">¿Ya tenés usuario?
        <a href="/login" class="font-semibold leading-6 text-zinc-600 hover:text-zinc-900">Iniciá sesión</a>
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
definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/'
  }
})
useHead({
  title: 'Registrar - Salón',
})

import { ref, computed } from 'vue'

const nombre = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const { signUp } = useAuth()

const userSignedUp = ref(false)

const toast = useToast();
import { useToast } from "primevue/usetoast";

const passwordError = computed(() => {
  return confirmPassword.value !== '' && password.value !== confirmPassword.value
})

const isFormValid = computed(() => {
  return nombre.value.length >= 3 && 
         email.value && 
         password.value && 
         confirmPassword.value && 
         !passwordError.value
})

const handleSignup = async () => {
  if (passwordError.value) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Las contraseñas no coinciden', life: 3000});
    return;
  }

  loading.value = true
  try {
    const credentials = { 
        email: email.value,
        password: password.value,
        nombre: nombre.value,
    }
    
    // Call signUp and handle both success and error cases
    try {
      const result = await signUp(credentials, undefined, { preventLoginFlow: true });
      // If we get here without an error, signup was successful
      userSignedUp.value = true;
    } catch (signUpError) {
      // Handle signUp errors
      console.error("Error", signUpError);
      
      if (signUpError.data?.errors && signUpError.data.errors.length) {
        let detail = "Hubo un error registrando el usuario";
        if (signUpError.data.errors[0]?.data?.some(e => e.field == "email")) {
          detail = "El mail no es válido";
        }
        toast.add({ severity: 'contrast', summary: 'Error', detail, life: 3000 });
      } else {
        toast.add({ severity: 'contrast', summary: 'Error', detail: "Error en el registro", life: 3000 });
      }
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    toast.add({ severity: 'contrast', summary: 'Error', detail: "Hubo un error en el registro", life: 3000});
  } finally {
    loading.value = false
  }
}
</script>