import { useRuntimeConfig, useNuxtApp } from '#app'
import type { UseFetchOptions } from 'nuxt/app'

export const useAPI = <T>(
  url: string | (() => string),
  options: UseFetchOptions<T> = {},
) => {
  const { $api } = useNuxtApp()
  
  // Don't include the base URL if the URL is already absolute
  const isAbsolute = typeof url === 'string' && url.startsWith('http')
  const finalUrl = isAbsolute ? url : url.toString()
  
  return $api(finalUrl, {
    ...options,
    $fetch: undefined
  })
}

export default defineNuxtPlugin((nuxtApp) => {
    const { status, token } = useAuth()
    const config = useRuntimeConfig()
    
    const api = $fetch.create({
      baseURL: config.public.apiBase,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      
      onRequest: async ({ request, options }) => {
        console.log("on request options", options)
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
        
        if (token.value) {
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${token.value}`,
          }
        }
      },
      
      onResponse({ response }) {
        console.info('onResponse ', {
          endpoint: response.url,
          status: response?.status,
        });
      },
      
      async onResponseError({ response }) {
        console.log('Response error', response)
        if (response.status === 401) {
          await nuxtApp.runWithContext(() => navigateTo('/login'))
        }
        const statusMessage = response?.status === 401 ? 'Unauthorized' : 'Response failed';
        console.error('onResponseError ', {
          endpoint: response.url,
          status: response?.status,
          statusMessage,
        });
        throw showError({
          statusCode: response?.status,
          statusMessage,
          fatal: true,
        });
      }
    })
  
    return {
      provide: {
        api
      }
    }
})


export const useUploadFile = async <T>(endpoint: string, body: any, method: string = 'POST'): Promise<T> => {
  const runtimeConfig = useRuntimeConfig().public;
  const { token } = useAuth();

  try {
    // Realizar la solicitud a la API
    const response: T = await $fetch(runtimeConfig.apiBase + endpoint, {
      method,
      headers: {
        'Authorization': token.value,
      },
      body,
    });

    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const useRandomFilenameBlob = (blob: Blob): string => {
  const random = Math.random().toString(36).substring(7);
  const ext = blob.type.split('/')[1];
  return `${random}.${ext}`;
}