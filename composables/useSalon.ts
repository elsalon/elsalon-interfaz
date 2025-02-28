import { useRoute } from 'nuxt/app'
// import { useSalonStore } from '@/store/salon'
import { ref } from "vue";

export default function useSalon() {
  const elsalon = useSalonStore()
  const pageId = elsalon.contextoId
  const paginaActual = ref(elsalon.salas.find(s => s.id === pageId) || elsalon.salas.find(s => s.slug === 'el-salon'))

  return {
    paginaActual
  }
}