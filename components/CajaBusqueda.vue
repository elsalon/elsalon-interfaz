<template>
    <InputGroup>
        <InputText placeholder="Buscar" v-model="searchQuery" size="small" v-on:keyup.enter="Buscar"/>
        <Button  icon="pi pi-search" severity="contrast" size="small" class="dark:bg-zinc-700 dark:text-zinc-100 dark:border-zinc-700" @click="Buscar"/>
    </InputGroup>
</template>

<script setup>
const searchQuery = ref('')
const router = useRouter()
const Buscar = () => {
    if(searchQuery.value.length == 0){
        return
    }
    // router push to /busqueda?query=asd
    router.replace({
        path: '/busqueda',  // specify the page route
        query: {
            query: searchQuery.value,
        }
    });
}
</script>