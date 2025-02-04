import { formatDate, formatDateCorto } from '~/utils/dateFormatter'

export default defineNuxtPlugin((nuxtApp) => {
  // Provide the formatDate function globally
  nuxtApp.provide('formatDate', formatDate)
  nuxtApp.provide('formatDateCorto', formatDateCorto)
})