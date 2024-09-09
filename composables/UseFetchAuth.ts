// Funcion para hacer llamados a la API con autenticacion
import { useRuntimeConfig } from '#app';

export const useApi = async <T>(endpoint: string, body: any, method: string = 'GET'): Promise<T> => {
  const runtimeConfig = useRuntimeConfig().public;
  const { token } = useAuth();

  try {
    // Chequear si body hay que convertirlo a JSON
    if (body && typeof body !== 'string') {
      body = JSON.stringify(body);
    }
    // Realizar la solicitud a la API
    const response: T = await $fetch(runtimeConfig.apiBase + endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
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