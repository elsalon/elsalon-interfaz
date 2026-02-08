<template>
  <div>
  <NuxtLayout name="layout-contenido">      
    <template #header>
        <RouterLink :to="`/`" class="link">S</RouterLink> /
        Guardados
    </template>
    
    <div class="my-6 flex flex-wrap justify-center">
        <Button
            class="text-zinc-800 dark:text-zinc-200 text-zinc-800 dark:text-zinc-200"
            :class="{'font-bold': currCategory === null}"
            @click="currCategory = null" text>
            Todos
        </Button>
        <Button v-for="category in GUARDADO_CATEGORIES" :key="category.value" class="text-zinc-800 dark:text-zinc-200 text-zinc-800 dark:text-zinc-200"
            :class="{'font-bold': currCategory === category.value}"
            @click="currCategory = category.value" text>
            {{ category.label }}
        </Button>
    </div>
    
    <ListaGuardados :query="query" :cacheKey="cacheKey" /> 
    
</NuxtLayout>
</div>
</template>


<script setup>
import { GUARDADO_CATEGORIES } from '~/utils/categories';
const auth = useAuth();
const currCategory = ref(null);
const cacheKey = computed(() => `guardados-${auth.data.value?.user?.id}-${currCategory.value || 'todos'}`);

const query = computed(() => {
    if (currCategory.value) {
        return {
            categoria: currCategory.value
        }
    }
    return {}
});
</script>