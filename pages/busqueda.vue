<template>
    <NuxtLayout name="layout-contenido">
        <template #header>
            <RouterLink :to="`/`" class="link">S</RouterLink> /
            Búsqueda
        </template>
        <form @submit.prevent="IniciarBusqueda" class="text-center">

            <InputText v-model="searchQuery" type="search" size="large" placeholder="Búsqueda" class="block w-full" />
            
            <div class="card flex flex-wrap justify-center gap-4 mt-4">
                <div v-for="category of categories" :key="category.key" class="flex items-center ">
                    <Checkbox v-model="selectedCategories" :inputId="category.key" name="category"
                    :value="category.key" />
                    <label :for="category.key" class="ml-2">{{ category.name }}</label>
                </div>
            </div>
            
            <Button type="submit" label="Buscar" class="mt-4 w-full md:w-auto" @click="IniciarBusqueda" iconPos="right" :disabled="isSearching" />
        </form>
        <div class="text-center h-30 mt-10" v-if="SinResultado">
            <p class="font-bold">"{{ lastQuery }}"</p>
            <p class="text-zinc-600">No se encontraron resultados</p>
        </div>

        <div class="my-8" v-else-if="searchResults">

            <NuxtLink v-for="usuario in searchResults.usuarios" :to="`/usuarios/${usuario.slug}`" :key="usuario.id"
                class="flex items-center hover:bg-zinc-200 p-2  gap-x-2">
                <AvatarSalon :usuario="usuario" class="w-16 h-16 object-cover" />
                <span class="">{{ usuario.nombre }}</span>
            </NuxtLink>



            <NuxtLink v-for="result in searchResults.entradas" :key="result.id" :to="`/entradas/${result.id}`"
                class=" hover:bg-zinc-200 p-2 flex items-center gap-x-2">

                <img v-if="result.imagenes.length > 0" :src="result.imagenes[0].imagen.sizes.medium.url"
                    class="h-16 aspect-square object-cover" />
                <img v-else :src="result.autor.avatar.sizes.medium.url" class="h-16 aspect-square object-cover" />

                <div>
                    <div>{{ result.extracto }}</div>
                    <div class="text-sm text-zinc-600">{{ result.autor.nombre }}
                        <time :datetime="result.createdAt">{{ $formatDate(result.createdAt) }}</time>
                    </div>
                </div>
            </NuxtLink>

            <NuxtLink v-for="result in searchResults.comentarios" :key="result.id" :to="`/entradas/${result.entrada.id}`"
                class=" hover:bg-zinc-200 p-2 flex items-center gap-x-2">

                <img v-if="result.imagenes.length > 0" :src="result.imagenes[0].imagen.sizes.medium.url"
                    class="h-16 aspect-square object-cover" />
                <img v-else :src="result.autor.avatar.sizes.medium.url" class="h-16 aspect-square object-cover" />

                <div>
                    <div>{{ result.extracto }}</div>
                    <div class="text-sm text-zinc-600">{{ result.autor.nombre }}
                        <time :datetime="result.createdAt">{{ $formatDate(result.createdAt) }}</time>
                    </div>
                </div>
            </NuxtLink>


            <NuxtLink v-for="grupo in searchResults.grupos" :to="`/grupos/${grupo.slug}`" :key="grupo.id"
                class="flex items-center hover:bg-zinc-200 p-2 gap-x-2">
                <AvatarSalon :usuario="grupo" class="w-16 h-16 object-cover" />
                <span class="">{{ grupo.nombre }}</span>
            </NuxtLink>

            <div v-if="isSearching" class="text-center mt-4">
                
                <Skeleton v-for="n in 10" :key="n" width="100%" height="80px" class="my-2"></Skeleton>
            </div>

            <Button v-if="hasMore" label="Cargar más" fluid class="mt-4" @click="CargarMas()" iconPos="right" :loading="isSearching" />
        </div>

    </NuxtLayout>
</template>

<script setup>
const salonStore = useSalonStore();
salonStore.SetPageTitle(`Búsqueda`)

const { $formatDate } = useNuxtApp()
const router = useRouter()
const searchQuery = ref('')
let lastQuery = ""
const isSearching = ref(false)
const mixpanel = useMixpanel()

const categories = ref([
    { name: "Entradas", key: "entradas" },
    { name: "Comentarios", key: "comentarios" },
    { name: "Usuarios", key: "usuarios" },
    { name: "Grupos", key: "grupos" },
]);
const selectedCategories = ref(categories.value.map(c => c.key));
const nuncaBusco = ref(true)

const searchResults = reactive({
    entradas: [],
    usuarios: [],
    grupos: [],
    comentarios: []
})
const hasMore = ref(false)
const page = ref(1)

const IniciarBusqueda = async () => {
    page.value = 1
    searchResults.entradas = []
    searchResults.usuarios = []
    searchResults.grupos = []
    searchResults.comentarios = []
    hasMore.value = false
    Buscar();
}

const CargarMas = async () => {
    page.value++
    Buscar();
}


const Buscar = async () => {
    if (!searchQuery.value) return
    if (selectedCategories.value.length === 0) return
    if (searchQuery.value.length < 3) return
    
    isSearching.value = true

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

    mixpanel.track('Busqueda', { query: searchQuery.value, categorias: selectedCategories.value.join(',') })

    try {
        const res = await useAPI(`/api/busqueda?query=${searchQuery.value}&categorias=${selectedCategories.value.join(',')}&page=${page.value}`, { method: 'GET' },)
        // console.log('Resultados:', res)
        searchResults.entradas = [...searchResults.entradas, ...res.results.entradas || []];
        searchResults.usuarios = [...searchResults.usuarios, ...res.results.usuarios || []];
        searchResults.grupos = [...searchResults.grupos, ...res.results.grupos || []];
        searchResults.comentarios = [...searchResults.comentarios, ...res.results.comentarios || []];
        hasMore.value = res.hasMore || false

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

// Si hay query params, buscar
const queryParams = router.currentRoute.value.query
if (queryParams.query) {
    searchQuery.value = queryParams.query
    if (queryParams.categorias) {
        selectedCategories.value = queryParams.categorias.split(',')
    } else {
        selectedCategories.value = categories.value.map(c => c.key)
    }
    IniciarBusqueda();
}
</script>
