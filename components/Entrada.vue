<script setup>
const props = defineProps({
    theme: {
        type: String,
        default: "default"
    },
    entrada: {
        type: Object,
        required: true,
    },
});
const emit = defineEmits(['eliminar']);
const auth = useAuth();

// Initialize entrada comentarios state
props.entrada.comentarios.fetching = false;
props.entrada.masComentarios = false;

// Component refs and state
const entradaDom = ref();
const resaltar = ref(false);

// Import composables
const { identidad, tituloIdentidad, identidadUrl, UsuarioTieneAutoridad, usuarioEsAdminODocente, tooltipIdentidad } 
  = useEntradaIdentidad(props.entrada, auth);

const { loading, CopiarLink, DestacarEntrada, FijarEntrada, EliminarEntrada } 
  = useEntradaAcciones(props.entrada, emit);

const { fetchComentarios, fetchComentariosRecientes } 
  = useEntradaComentarios(props.entrada);

// Component render logic
const entradaRenderComponent = computed(() => {
  if (typeof props.theme === 'string') {
    return {
      default: resolveComponent('EntradaDefault'),
      biblioteca: resolveComponent('EntradaBiblioteca')
    }[props.theme];
  }
  return props.theme;
});

// Highlight functionality
const ResaltarEntrada = () => {
  resaltar.value = true;
  const rect = entradaDom.value.$el.getBoundingClientRect();
  if (rect.top < 0 || rect.bottom > window.innerHeight) {
    entradaDom.value.$el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  setTimeout(() => {
    resaltar.value = false;
  }, 1200);
};

// Lifecycle hooks
let removeOnEditHook = null;

const handlePublicacionEditada = async (data) => {
  if (data.resultado == "ok" && data.entrada.id == props.entrada.id) {
    ResaltarEntrada();
  }
};

onMounted(() => {
  removeOnEditHook = useNuxtApp().hooks.hook('publicacion:editada', handlePublicacionEditada);
  
  // Check if we should open the playlist based on URL
  const currentPath = window.location.pathname;
  if (currentPath.includes('/playlist') && props.entrada?.id) {
    // Small delay to ensure all components are mounted
    setTimeout(() => {
      useNuxtApp().callHook("videoplaylist:open", {entrada: props.entrada});
      
      // This URL modification is redundant since handleOpenVideoPlaylist 
      // will also set the URL, but leaving it for clarity
      window.history.replaceState(null, '', currentPath);
    }, 100);
  }
});

onUnmounted(() => {
  if (removeOnEditHook) removeOnEditHook();
});

defineExpose({ ResaltarEntrada });
</script>

<template>
    <component
        ref="entradaDom"
        v-if="identidad?.nombre"
        :is="entradaRenderComponent"
        :key="entrada.id"
        :loading="loading"
        :entrada="entrada"
        :identidadUrl="identidadUrl"
        :identidad="identidad"
        :tooltipIdentidad="tooltipIdentidad"
        :tituloIdentidad="tituloIdentidad"
        :UsuarioTieneAutoridad="UsuarioTieneAutoridad"
        :usuarioEsAdminODocente="usuarioEsAdminODocente"
        :EliminarEntrada="EliminarEntrada"
        :FijarEntrada="FijarEntrada"
        :CopiarLink="CopiarLink"
        :DestacarEntrada="DestacarEntrada"
        :resaltar="resaltar"
        @fetchComentarios="fetchComentarios"
        @fetchComentariosRecientes="fetchComentariosRecientes"
    />
</template>