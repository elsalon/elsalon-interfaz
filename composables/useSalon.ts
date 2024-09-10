import { useRoute } from 'nuxt/app'
// import { useSalonStore } from '@/store/salon'
import { ref } from "vue";

export default function useSalon() {
  const route = useRoute()
  const elsalon = useSalonStore()

  const slug = route.params?.slug || 'el-salon'
  const paginaActual = ref(elsalon.salones.find(s => s.slug === slug) || 'el-salon')

  return {
    slug,
    paginaActual
  }
}