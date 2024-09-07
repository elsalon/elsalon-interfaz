<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
        <form class="mt-8 space-y-6" @submit.prevent="handleSignup">
          <input type="hidden" name="remember" value="true">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="username" class="sr-only">Username</label>
              <input id="username" name="username" type="text" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Username" v-model="username">
            </div>
            <div>
              <label for="email-address" class="sr-only">Email address</label>
              <input id="email-address" name="email" type="email" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Email address" v-model="email">
            </div>
            <div>
              <label for="password" class="sr-only">Password</label>
              <input id="password" name="password" type="password" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Password" v-model="password">
            </div>
          </div>
          <div>
            <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
<script setup>
// Permito que se pueda acceder a la página sin autenticación
definePageMeta({
  auth: false
})

import { ref } from 'vue'
const { signup } = useAuth()

const username = ref('')
const email = ref('')
const password = ref('')
const { signUp } = useAuth()

const handleSignup = async () => {
  try {
    // // You'll need to implement this API call yourself
    // const response = await $fetch('/api/users', {
    //   method: 'POST',
    //   body: {
    //     // username: username.value,
    //     email: email.value,
    //     password: password.value
    //   }
    // })
    const credentials = { 
        email: email.value,
        password: password.value
    }
    await signUp(credentials,
        {
            callbackUrl: '/',
            redirect: true,
        }
    )
    
    // After successful signup, sign in the user
    // await signIn({
    //   email: email.value,
    //   password: password.value
    // })
  } catch (error) {
    console.error('Signup failed:', error)
  }
}
</script>