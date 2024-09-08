<template>
    <div>
        
        
        <div class="space-y-20 ">
            <template v-for="entrada in docs" :key="entrada.id">
                <Entrada :entrada="entrada" />
            </template>
        </div>
        
    </div>
</template>


<script setup>

const {docs, hasNextPage, page} = await useApi('api/entradas')
// console.log('Entradas:', docs)


</script>