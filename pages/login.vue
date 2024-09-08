<template>
    <div>
      <h1>Login</h1>
      <form @submit.prevent="handleSubmit">
        <div>
            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" v-model="email" type="email" placeholder="Email" required>
        </div>
        <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" v-model="password" type="password" placeholder="Password" required>
        <div>
            <button type="submit">Login</button>
        </div>
      </form>
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
  
  const email = ref('')
  const password = ref('')
  const { signIn } = useAuth()
  
  const handleSubmit = async () => {
    try {
      await signIn({ 
        email: email.value,
        password: password.value
    }, {
        callbackUrl: '/'
    })
    } catch (error) {
      console.error('Login failed:', error)
    }
  }
  </script>