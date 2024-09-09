<template>
    <div>
      <div v-if="salonStore.loading">Loading...</div>
      <div v-else-if="salonStore.initialized">
        <slot></slot>
      </div>
      <div v-else>Error loading data</div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useSalonStore } from '~/stores/SalonConfig'
  
  const salonStore = useSalonStore()
  
  onMounted(async () => {
    if (!salonStore.initialized) {
      await salonStore.fetchConfig()
    }
  })
  </script>