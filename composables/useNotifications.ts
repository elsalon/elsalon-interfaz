// composables/useNotifications.ts
import { ref, onMounted, onUnmounted } from 'vue'

const CACHE_DURATION = .5 * 60 * 1000 // minutes in milliseconds

// Shared state
const sharedState = {
  notifications: ref([]),
  lastFetchTime: ref(null),
  isLoading: ref(false),
  error: ref(null),
  notificacionSinLeer: ref(0),
  loadedOnce: ref(false)
}

// let firstFetch = true;

export function useNotifications() {
  const pollingInterval = ref(null)

  const fetchNotifications = async (force = false) => {
    const now = Date.now()
    if (!force && sharedState.lastFetchTime.value && (now - sharedState.lastFetchTime.value < CACHE_DURATION)) {
      return // Use cached data
    }

    sharedState.isLoading.value = true
    sharedState.error.value = null

    try {
      const { docs: newNotifications, totalDocs: notificacionSinLeer } = await useAPI('/api/notificaciones?where[leida][not_equals]=true&limit=1')
      console.log('Fetched notifications:', newNotifications, notificacionSinLeer)
      sharedState.notificacionSinLeer.value = notificacionSinLeer
      
      // Compare with existing notifications and show toast for new ones
      const newOnes = newNotifications.filter(notification => 
        !sharedState.notifications.value.some(existing => existing.id === notification.id)
      )
      
      sharedState.notifications.value = newNotifications
      sharedState.lastFetchTime.value = now
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      sharedState.error.value = error
    } finally {
      sharedState.isLoading.value = false
    }
  }

  const startPolling = () => {
    stopPolling() // Clear any existing interval
    pollingInterval.value = setInterval(() => fetchNotifications(true), 5 * 60 * 1000) // minutes
  }

  const stopPolling = () => {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value)
      pollingInterval.value = null
    }
  }

  onMounted(() => {
    if(sharedState.loadedOnce.value) return
    sharedState.loadedOnce.value = true
    fetchNotifications()
    startPolling()
  })

  onUnmounted(() => {
    stopPolling()
  })

  return {
    notifications: sharedState.notifications,
    notificacionSinLeer: sharedState.notificacionSinLeer,
    isLoading: sharedState.isLoading,
    error: sharedState.error,
    fetchNotifications,
    startPolling,
    stopPolling
  }
}