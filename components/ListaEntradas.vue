<template>
    <div class="space-y-20">
        <Entrada v-for="entrada in docs" :key="entrada.id" :entrada="entrada" />
    </div>
</template>


<script setup>
    const {docs, hasNextPage, page} = await useApi('api/entradas')
    // console.log('Entradas:', docs)
</script>