export default defineNuxtPlugin((nuxtApp) => {
    const { status, token } = useAuth()
    const config = useRuntimeConfig()
    
    // Create the fetch instance with our custom configuration
    const customFetch = async (request: string, options: any = {}) => {
      if (!options.noAuth) {
        await new Promise((resolve, reject) => {
          if (status.value === 'authenticated') {
            resolve(true)
            return
          }

          const unwatch = watch(status, (newStatus) => {
            if (newStatus === 'authenticated') {
              unwatch()
              resolve(true)
            }
          })

          setTimeout(() => {
            unwatch()
            reject(new Error('Authentication timeout'))
          }, 10000)
        })
      }

      // Prepare the final options with auth header
      const finalOptions = {
        ...options,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...options.headers,
        }
      }

      if (token.value) {
        finalOptions.headers.Authorization = token.value
      }

      // Handle baseURL
      const baseURL = config.public.apiBase
      const fullUrl = request.startsWith('http') ? request : `${baseURL}${request}`

      try {
        const response = await $fetch(fullUrl, finalOptions)
        return response
      } catch (error: any) {
        if (error.response?.status === 401) {
          await nuxtApp.runWithContext(() => navigateTo('/login'))
        }
        throw error
      }
    }

    return {
      provide: {
        api: customFetch
      }
    }
})
  