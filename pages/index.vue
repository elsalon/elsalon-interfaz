<template>
    <div>
      <h1 class="text-3xl font-bold">Welcome, {{ data.user.email }}!</h1>
      *{{ $auth }}*
      <button @click="handleLogout">Logout</button>
    </div>
  </template>
  
  <script setup>
  const { data, signOut } = useAuth()
  const handleLogout = () => signOut({ callbackUrl: '/login' })
  </script>