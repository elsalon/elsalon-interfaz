<template>Cargando perfil</template>
<script setup>
    const elsalon = useSalonStore();
    elsalon.setContext('opciones')
    // Redirect to /perfil
    navigateTo('/opciones/perfil')
</script>