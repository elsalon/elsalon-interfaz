export default defineNuxtRouteMiddleware((to, from) => {
    if (to.path === '/opciones') {
      return navigateTo('/opciones/perfil')
    }
  })
  