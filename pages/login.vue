<template>
    <div>
      <h1>Login</h1>
      <form @submit.prevent="handleSubmit">
        <input v-model="email" type="email" placeholder="Email" required>
        <input v-model="password" type="password" placeholder="Password" required>
        <button type="submit">Login</button>
      </form>
    </div>
  </template>
  
  <script setup>
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