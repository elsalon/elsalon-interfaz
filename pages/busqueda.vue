<template>
    <NuxtLayout name="layout-contenido">
        <template #header>
            <RouterLink :to="`/`" class="link">S</RouterLink> /
            Búsqueda
        </template>
        <form @submit.prevent="Buscar">

            <InputText v-model="searchQuery" type="search" size="large" placeholder="Búsqueda" class="block w-full" />

            <div class="card flex flex-wrap gap-4 mt-4">
                <div v-for="category of categories" :key="category.key" class="flex items-center">
                    <Checkbox v-model="selectedCategories" :inputId="category.key" name="category"
                        :value="category.key" />
                    <label :for="category.key" class="ml-2">{{ category.name }}</label>
                </div>
            </div>

            <Button type="submit" label="Buscar" class="mt-4" @click="Buscar" iconPos="right" :loading="isSearching" />
        </form>
            <div class="mt-4" v-if="SinResultado">
                <p>No se encontraron resultados para <strong>{{ lastQuery }}</strong></p>
            </div>
        
            <div class="my-8" v-else-if="searchResults">
                <!-- Resultados Entradas -->
                <!-- <template v-if="searchResults.entradas.length"> -->
                    <!-- <h3 class="text-xl font-bold mt-4">Entradas</h3> -->
                    <!-- <ul> -->
                        <!-- <li > -->
                            <NuxtLink v-for="result in searchResults.entradas" :key="result.id" :to="`/entradas/${result.id}`" class=" hover:bg-zinc-100 p-2 flex items-center gap-x-2">
                                
                                <img v-if="result.imagenes.length > 0" :src="result.imagenes[0].imagen.sizes.medium.url" class="h-16 aspect-square object-cover" />
                                <img v-else :src="result.autor.avatar.sizes.medium.url" class="h-16 aspect-square object-cover" />
                                    
                                
                                <div>
                                    <div>{{ result.extracto }}</div>
                                    <div class="text-sm text-zinc-500">{{ result.autor.nombre }}
                                        <time :datetime="result.createdAt">{{$formatDate(result.createdAt) }}</time>
                                    </div>
                                </div>
                            </NuxtLink>
                        <!-- </li> -->
                    <!-- </ul> -->
                <!-- </template> -->

                <!-- Resultados Usuarios -->
                <!-- <template v-if="searchResults.usuarios.length"> -->
                    <!-- <h3 class="text-xl font-bold mt-4">Usuarios</h3> -->
                    <!-- <div class="flex flex-wrap gap-4"> -->
                        <NuxtLink v-for="usuario in searchResults.usuarios" :to="`/usuarios/${usuario.slug}`"
                            :key="usuario.id" class="flex items-center hover:bg-zinc-100 p-2  gap-x-2">
                            <AvatarSalon :usuario="usuario" class="w-16 h-16 object-cover" />
                            <span class="">{{ usuario.nombre }}</span>
                        </NuxtLink>
                    <!-- </div> -->
                <!-- </template> -->

                <!-- Resultados Grupos -->
                <!-- <template v-if="searchResults.grupos.length"> --> 
                    <!-- <h3 class="text-xl font-bold mt-4">Grupos</h3>
                    <div class="flex flex-wrap gap-4"> -->
                        <NuxtLink v-for="grupo in searchResults.grupos" :to="`/grupos/${grupo.slug}`" :key="grupo.id"
                            class="flex items-center hover:bg-zinc-100 p-2  gap-x-2" >
                            <AvatarSalon :usuario="grupo" class="w-16 h-16 object-cover" />
                            <span class="">{{ grupo.nombre }}</span>
                        </NuxtLink>
                    <!-- </div> -->
                <!-- </div> -->
        </div>

        <!-- {{ searchResults }} -->
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
        const res = await useAPI(`/api/busqueda?query=${searchQuery.value}&categorias=${selectedCategories.value.join(',')}`, { method: 'GET' }, )
        // console.log('Resultados:', res)
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

// Si hay query params, buscar
const queryParams = router.currentRoute.value.query
if(queryParams.query){
    searchQuery.value = queryParams.query
    if(queryParams.categorias){
        selectedCategories.value = queryParams.categorias.split(',')
    }else{
        selectedCategories.value = categories.value.map(c => c.key)
    }
    Buscar();
}
</script>
