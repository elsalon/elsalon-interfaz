// ~/plugins/mixpanel.client.ts
export default defineNuxtPlugin(() => {
    const { status, data } = useAuth()
    const mixpanel = useMixpanel()
  
    watchEffect(() => {
      if (status.value === 'authenticated') {
        // console.log("***", status.value, data.value)
        const user = data.value?.user
        mixpanel.identify(user?.id)
        mixpanel.people?.set({
          $name: user?.nombre,
          $avatar: user?.avatar?.sizes.thumbnail.url,
          $last_login: new Date(),
        })
      }
    })
  })