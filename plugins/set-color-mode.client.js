export default defineNuxtPlugin(() => {
  const { data: authData } = useAuth();
  const colorMode = useColorMode()

  // Watch for session changes (e.g., after login)
  watchEffect(() => {
    if(!authData.value?.user) return;
    colorMode.preference = authData.value.user.opciones.theme;
  })
})