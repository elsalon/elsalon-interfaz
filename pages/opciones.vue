<template>
  <div>
  <NuxtLayout name="layout-contenido">      
    <template #header>
        <RouterLink :to="`/`" class="link">S</RouterLink> /
        Opciones
    </template>
    <nav id="opciones-nav" class="space-x-2 mb-8">
      <NuxtLink to="/opciones/perfil" active-class="active">Perfil</NuxtLink>
      <NuxtLink to="/opciones/configuracion" active-class="active">Configuracion</NuxtLink>
      <NuxtLink to="/opciones/grupos" active-class="active">Grupos</NuxtLink>
    </nav>
    <!-- Render the child page -->
    <NuxtPage  />
  </NuxtLayout>
</div>
</template>


<script setup>
</script>