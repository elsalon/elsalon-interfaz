<template>
    <NuxtLayout name="layout-contenido">
        <form @submit.prevent="Buscar">

            <InputText v-model="searchQuery" type="text" size="large" placeholder="Búsqueda" class="block w-full" />

            <div class="card flex flex-wrap gap-4 mt-4">
                <div v-for="category of categories" :key="category.key" class="flex items-center">
                    <Checkbox v-model="selectedCategories" :inputId="category.key" name="category"
                        :value="category.key" />
                    <label :for="category.key" class="ml-2">{{ category.name }}</label>
                </div>
            </div>

            <Button type="submit" label="Buscar" class="mt-4" @click="Buscar" :loading="isSearching" />
        </form>
        <template v-if="SinResultado">
            <div class="mt-4">
                <p>No se encontraron resultados para <strong>{{ lastQuery }}</strong></p>
            </div>
        </template>
        <template v-else-if="searchResults">
            <div class="mt-4">
                <!-- Resultados Entradas -->
                <div v-if="searchResults.entradas.length">
                    <h3 class="text-xl font-bold mt-4">Entradas</h3>
                    <ul>
                        <li v-for="result in searchResults.entradas" :key="result.id">
                            <NuxtLink :to="`/entradas/${result.id}`" class="block mb-3">
                                <div>{{ result.extracto }}</div>
                                <div class="text-sm text-gray-400">{{ result.autor.nombre }} - {{
            $formatDate(result.createdAt) }}</div>
                            </NuxtLink>
                        </li>
                    </ul>
                </div>

                <!-- Resultados Usuarios -->
                <div v-if="searchResults.usuarios.length">
                    <h3 class="text-xl font-bold mt-4">Usuarios</h3>
                    <div class="flex flex-wrap gap-4">
                        <NuxtLink v-for="usuario in searchResults.usuarios" :to="`/usuarios/${usuario.slug}`"
                            :key="usuario.id" class="flex items-center gap-x-2">
                            <AvatarSalon :usuario="usuario" class="w-8 h-8" />
                            <span class="text-sm text-gray-700">{{ usuario.nombre }}</span>
                        </NuxtLink>
                    </div>
                </div>

                <!-- Resultados Grupos -->
                <div v-if="searchResults.grupos.length">
                    <h3 class="text-xl font-bold mt-4">Grupos</h3>
                    <div class="flex flex-wrap gap-4">
                        <NuxtLink v-for="grupo in searchResults.grupos" :to="`/grupos/${grupo.slug}`" :key="grupo.id"
                            class="flex items-center gap-x-2">
                            <AvatarSalon :usuario="grupo" class="w-8 h-8" />
                            <span class="text-sm text-gray-700">{{ grupo.nombre }}</span>
                        </NuxtLink>
                    </div>
                </div>

            </div>
        </template>

        <!-- {{ searchResults }} -->
    </NuxtLayout>
</template>

<script setup>
const { $formatDate } = useNuxtApp()
const router = useRouter()
const searchQuery = ref('')
let lastQuery = ""
const isSearching = ref(false)

const categories = ref([
    { name: "Entradas", key: "entradas" },
    { name: "Usuarios", key: "usuarios" },
    { name: "Grupos", key: "grupos" },
]);
const selectedCategories = ref(categories.value.map(c => c.key));
const nuncaBusco = ref(true)

const searchResults = reactive({
    entradas: [],
    usuarios: [],
    grupos: []
})

const Buscar = async () => {
    if (!searchQuery.value) return
    if (selectedCategories.value.length === 0) return
    if (searchQuery.value.length < 3) return

    isSearching.value = true
    searchResults.entradas = []
    searchResults.usuarios = []
    searchResults.grupos = []

    lastQuery = searchQuery.value
    nuncaBusco.value = false
    console.log('Buscar', searchQuery.value, selectedCategories.value)

    router.push({
        path: '/busqueda',  // specify the page route
        query: {
            query: searchQuery.value,
            categorias: selectedCategories.value.join(',')
        }
    });

    try {
        const res = await useApi(`/api/busqueda?query=${searchQuery.value}&categorias=${selectedCategories.value.join(',')}`)
        console.log('Resultados:', res)
        searchResults.entradas = res.entradas?.docs || [];
        searchResults.usuarios = res.usuarios?.docs || [];
        searchResults.grupos = res.grupos?.docs || [];

    } catch (error) {
        console.error('Error during search:', error)
        // Handle error (e.g., show error message to user)
    } finally {
        isSearching.value = false
    }
}

const SinResultado = computed(() => {
    if (isSearching.value) return false;
    if (nuncaBusco.value) return false;
    return searchResults.entradas.length === 0 && searchResults.usuarios.length === 0 && searchResults.grupos.length === 0
})
</script>
