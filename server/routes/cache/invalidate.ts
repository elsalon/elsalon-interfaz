import { defineEventHandler, getQuery } from 'h3';
import { useRuntimeConfig } from '#imports';
import { parseSalaCache } from './config';

// Reference to the shared cache object
let cacheRef: any = null;
let cacheTimestampRef = 0;

// Function to get reference to the cache object
export function setCacheReference(cache: any, timestamp: number) {
  cacheRef = cache;
  cacheTimestampRef = timestamp;
}

export default defineEventHandler(async (event) => {
  // Get query parameters
  const query = getQuery(event);
  const salaId = query.salaId as string;
  const runtimeConfig = useRuntimeConfig().public;
  
  // If no cache reference, return error
  if (!cacheRef) {
    return {
      success: false,
      message: 'Cache reference not initialized',
    };
  }

  // If specific sala ID is provided, refresh only that sala
  if (salaId) {
    try {
      // Use depth=2 to ensure we get full objects for first-level relationships
      console.log("Invalidate. Refresh ", `${runtimeConfig.apiBase}/api/salas/${salaId}?depth=1`)
      const salaRes = await $fetch(`${runtimeConfig.apiBase}/api/salas/${salaId}?depth=1`);
      
      // Check if the sala exists in the cache before updating
      const existingSalaIndex = cacheRef.salas.findIndex((sala: any) => sala.id === salaId);
      
      if (existingSalaIndex !== -1) {
        // Replace the sala in the cache
        cacheRef.salas[existingSalaIndex] = salaRes;
        
        // Create periods for the updated sala
        await parseSalaCache(cacheRef.salas[existingSalaIndex]);
        
        return {
          success: true,
          message: `Cache refreshed for sala: ${salaId}`,
          data: cacheRef.salas[existingSalaIndex]
        };
      } else {
        return {
          success: false,
          message: `Sala ${salaId} not found in cache`,
        };
      }
    } catch (error) {
      console.error("Error refreshing sala:", error);
      return {
        success: false,
        message: `Error refreshing sala: ${error}`,
      };
    }
  } else {
    // Invalidate the entire cache by setting timestamp to 0
    cacheTimestampRef = 0;
    
    return {
      success: true,
      message: 'Cache invalidated successfully',
    };
  }
});