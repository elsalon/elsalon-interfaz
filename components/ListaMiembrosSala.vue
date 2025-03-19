<script setup>
const props = defineProps({
    miembros: {
        type: Object,
        default: null,
    },
    maxAvatares: {
        type: Number,
        default: 3,
    }
})

const mostrarTodosLosMiembros = ref(false)

</script>

<template>
    <div class="flex-1 md:w-1/2  items-center">
        <div class="text-md text-muted-color" v-if="miembros?.docs">
            <div v-if="miembros.totalDocs == 0" class="text-muted text-sm">Sin miembros</div>
            <div v-else class="flex justify-center space-x-1 items-center">
                <NuxtLink v-for="miembro in miembros.docs.slice(0,maxAvatares)" :key="miembro.id"
                    :to="`/usuarios/${miembro.autor.slug}`" v-tooltip.top="miembro.autor.nombre" class="h-6">
                    <AvatarSalon :usuario="miembro.autor" size="small" imagesize="small" />
                </NuxtLink>
                
                <Button v-show="miembros.totalDocs > maxAvatares" link class="my-2 text-surface-500" style="padding: 0" :label="`+${miembros.totalDocs - maxAvatares}`" @click="mostrarTodosLosMiembros=true" />
            </div>
        </div>
        <div v-else class="text-muted">...</div>
    </div>

    <Dialog v-model:visible="mostrarTodosLosMiembros" modal header="Miembros" :style="{ width: '25rem' }" :dismissableMask="true">
        <div :class="{'grid grid-cols-1': miembros.docs.length === 1, 'grid grid-cols-1 md:grid-cols-2': miembros.docs.length > 1}">
            <NuxtLink v-for="doc in miembros.docs" :key="doc.id" :to="`/usuarios/${doc.autor.slug}`"
                class="flex gap-2 items-center p-2 hover:bg-zinc-200 w-full">
                <AvatarSalon :usuario="doc.autor" />
                {{ doc.autor.nombre }}
            </NuxtLink>
        </div>
    </Dialog>
</template>