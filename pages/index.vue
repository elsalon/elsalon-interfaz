<template>
    <NuxtLayout name="layout-contenido">


    
        <h1 class="text-3xl font-bold">Welcome, {{ data.user.email }}!</h1>
        
        <button @click="handleLogout">Logout</button>

        <EditorEntrada />

        <ListaEntradas />
    
    </NuxtLayout>
  </template>
  
  <script setup>
  const { data, signOut } = useAuth()
  const handleLogout = () => signOut({ callbackUrl: '/login' })
  </script>