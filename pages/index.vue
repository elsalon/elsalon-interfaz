<template>
    <div>
        
      <h1>Welcome, {{ data.user.email }}!</h1>
      <button @click="handleLogout">Logout</button>
    </div>
  </template>
  
  <script setup>
  const { data, signOut } = useAuth()
  const handleLogout = () => signOut({ callbackUrl: '/login' })
  </script>