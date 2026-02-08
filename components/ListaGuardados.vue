<template>
  <!-- Initial Loading State -->
  <div v-if="initialLoading" class="text-center h-40 mt-10 flex flex-col justify-center items-center text-zinc-500">
    Cargando...
  </div>

  <!-- Empty State -->
  <div v-else-if="items.length === 0" class="text-center h-40 mt-10 flex flex-col justify-center items-center">
    <p class="font-bold text-zinc-900 dark:text-zinc-100">{{ emptyStateTitle }}</p>
    <p v-if="emptyStateSubtitle" class="text-zinc-600 dark:text-zinc-400">{{ emptyStateSubtitle }}</p>
  </div>

  <!-- Content -->
  <div v-else class="space-y-24">
    <template v-for="item in items" :key="item.id">
      <Entrada v-if="item.contenido.relationTo === 'entradas'" :entrada="item.contenido.value" />
      <Comentario v-else-if="item.contenido.relationTo === 'comentarios'" :comentario="item.contenido.value" />
    </template>
  </div>

  <div class="h-10"></div>
  <div>
    <!-- Loading Indicator -->
    <Transition enter-from-class="translate-y-full opacity-0" enter-to-class="translate-y-0 opacity-100"
      leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-full opacity-0"
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-300 ease-in">
      <div v-if="loading"
        class="fixed left-1/2 transform -translate-x-1/2 text-sm flex items-center bg-zinc-100/80 dark:bg-surface-900/80 p-1 transition-all duration-300 ease-in-out animate-slide-in-bottom"
        :class="{ 'bottom-4': loading, '-bottom-full': !loading }">
        <span class="texto-cargando">
          Cargando...
        </span>
      </div>
    </Transition>
    <!-- Pagination Status -->
    <div v-show="!hasNextPage && items.length !== 0" class="mt-10 h-10 text-center text-zinc-400 text-sm">
      No hay más guardados
    </div>
  </div>

  <!-- Intersection observer target -->
  <div ref="observerTarget" class="h-4"></div>
</template>

<script setup>
import { computed, watch } from "vue";

const props = defineProps({
  apiUrl: { type: String, default: '/api/guardado/list' },
  query: { type: Object, default: () => ({}) },
  cacheKey: { type: String, default: null },
  emptyStateTitle: { type: String, default: 'No tenés guardados' },
  emptyStateSubtitle: { type: String, default: 'Guardá entradas para verlas acá' },
});

const {
  items,
  hasNextPage,
  loading,
  initialLoading,
  observerTarget,
  initialFetch,
  refetch,
} = usePaginatedList({
  apiUrl: computed(() => props.apiUrl),
  query: computed(() => props.query),
  cacheKey: computed(() => props.cacheKey),
  paginationField: 'createdAt',
  defaultParams: {
    depth: 3,
  },
});

await initialFetch();

// Watch for cacheKey changes and refetch
watch(() => props.cacheKey, async (newKey, oldKey) => {
  if (newKey === oldKey) return;
  await refetch();
});
</script>
