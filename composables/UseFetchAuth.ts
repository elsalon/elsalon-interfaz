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