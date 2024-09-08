<template>
    <NuxtLayout name="layout-contenido">


        <button @click="handleLogout">Logout</button>

        
        <EditorEntrada />
        

        <ListaEntradas />
    
    </NuxtLayout>
  </template>
  
  <script setup>
    import Button from 'primevue/button';
    const { data, signOut } = useAuth()
    const handleLogout = () => signOut({ callbackUrl: '/login' })
</script>