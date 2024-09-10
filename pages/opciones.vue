<template>
  <NuxtLayout name="layout-contenido">            
    <nav id="opciones-nav" class="space-x-2">
      <NuxtLink to="/opciones/perfil" active-class="active">Perfil</NuxtLink>
      <NuxtLink to="/opciones/configuracion" active-class="active">Configuracion</NuxtLink>
    </nav>
    <!-- Render the child page -->
    <nuxt-child />
  </NuxtLayout>

</template>


<script setup>
</script>