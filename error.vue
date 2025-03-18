<script setup lang="ts">
import type { NuxtError } from '#app'
const router = useRouter()
const props = defineProps({
  error: Object as () => NuxtError
})

const errorMessage = computed(() => {
  if (!props.error) return 'Se ha producido un error desconocido'
  
  // Handle different error types with specific messages
  if (props.error.statusCode === 404) {
    return 'La página que estás buscando no existe'
  } else if (props.error.statusCode === 403) {
    return 'No tienes permiso para acceder a esta página'
  } else if (props.error.statusCode >= 500) {
    return 'Error en el servidor. Intenta de nuevo más tarde'
  }
  
  return props.error.message || 'Se ha producido un error'
})

// Track error in Mixpanel
const trackError = () => {
  const mixpanel = useMixpanel()
  
  // Gather relevant information for tracking
  const errorData = {
    statusCode: props.error?.statusCode || 'unknown',
    statusMessage: props.error?.statusMessage || '',
    errorMessage: errorMessage.value,
    url: window.location.href,
    path: window.location.pathname,
    referrer: document.referrer || '',
    timestamp: new Date().toISOString()
  }
  
  // Send error data to Mixpanel
  mixpanel.track('Error Encountered', errorData)
}

// Track the error when component is mounted
onMounted(() => {
  trackError()
})

// Allow going back to the previous page
const handleGoBack = () => {
  window.history.length > 1 ? router.go(-1) : navigateTo('/')
}
</script>

<template>
  <div class="flex justify-center items-center h-screen">
    <div class="text-center max-w-md px-4">
      <Avatar label="S" shape="" size="large" style="background-color: black" class="text-white mb-5"/>
      
      <h1 class="text-4xl font-medium mb-2">
        {{ error?.statusCode || 'Error' }}
      </h1>
      
      <p class="text-xl font-medium mb-3">{{ errorMessage }}</p>
      
      <p v-if="error?.statusMessage" class="text-gray-500 mb-6">
        {{ error.statusMessage }}
      </p>
      
      <div class="flex gap-4 justify-center">
        <Button @click="handleGoBack" severity="secondary" label="Volver atrás" />
        <Button as="a" label="Ir al inicio" href="/" />
      </div>
      
    </div>
  </div>
</template>
