<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: Object as () => NuxtError
})
</script>

<template>
  <div class="flex justify-center items-center h-screen bg-white">
        <div class="text-center">
            <Avatar label="S" size="large" shape="" style="background-color: black" class="text-white mb-5"/>
            <h1 class="text-4xl font-medium">404</h1>
            <p class="text-xl font-medium m-6">La pagina no existe. Es un bug?</p>
            <a href="/" class="bg-black hover:bg-slate-800 text-white py-2 px-4">Inicio</a>
        </div>
    </div>
</template>
