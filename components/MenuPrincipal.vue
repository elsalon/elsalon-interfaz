<template>
    <Avatar label="☰" class="select-none cursor-pointer bg-black text-white" size="large" shape=""
        @click="toggleSalasMenu" />
    <Drawer v-model:visible="menuSalasVisible" class="!w-full md:!w-80 lg:!w-[30rem]">

        <!-- Widget Busqueda -->
        <div class="mb-3">
            <CajaBusqueda />
        </div>

        <div v-for="item in salonStore.salas" class="ml-1 lista-salas">
            <NuxtLink :to="GenerateSalaUrl(item.slug)" class="flex items-center mb-1 hover:font-bold">
                <span class="mr-2">
                    <Avatar v-if="item?.avatar" :image="item.avatar.sizes.medium.url" shape=""
                        class="md:w-12 md:h-12" />
                    <Avatar v-else :label="item.siglas"
                        :style="{ backgroundColor: item.color || '#000', color: '#fff' }" shape=""
                        class="md:w-12 md:h-12 text-xs md:text-base" />
                </span>
                <span class="md:text-lg">{{ item.nombre }}</span>
            </NuxtLink>
        </div>
    </Drawer>
</template>

<script setup>

const salonStore = useSalonStore();
const { GenerateSalaUrl } = useGenerateSalaUrl()
const menuSalasVisible = ref(false)
const toggleSalasMenu = () => {
    menuSalasVisible.value = true;
};

</script>