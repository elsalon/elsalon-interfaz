<template>
    <InputGroup>
        <InputText placeholder="Buscar" v-model="searchQuery" size="small" v-on:keyup.enter="Buscar"/>
        <Button  icon="pi pi-search" severity="contrast" size="small" @click="Buscar"/>
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