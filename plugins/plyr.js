import Plyr from 'plyr'
import 'plyr/dist/plyr.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('plyr', Plyr)
})