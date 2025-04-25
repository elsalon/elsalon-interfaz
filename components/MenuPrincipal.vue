<template>
    <Avatar label="☰" class="self-baseline select-none cursor-pointer bg-black text-white" size="large" shape=""
        @click="toggleSalasMenu" />
    <Drawer v-model:visible="menuSalasVisible" class="!w-full md:!w-80 lg:!w-[30rem]">

        <!-- Widget Busqueda -->
        <div class="mb-3">
            <CajaBusqueda />
        </div>


        <div  class="ml-1 lista-salas">
            <!-- Link bitáctora -->
            <NuxtLink :to="`/usuarios/${auth?.data.value.user.slug}`" class="flex items-center mb-1 hover:font-bold">
                
                <AvatarSalon class="mr-2 w-8 h-8 md:w-12 md:h-12" :usuario="auth?.data.value.user"/>
                
                <span class="md:text-lg">Bitácora</span>
            </NuxtLink>
            <!-- Links salas -->
            <NuxtLink v-for="item in salonStore.salas" :to="GenerateSalaUrl(item.slug)" class="flex items-center mb-1 hover:font-bold">
                <span class="mr-2">
                    <Avatar v-if="item?.avatar" :image="item.avatar.sizes.thumbnail.url" shape=""
                        class="md:w-12 md:h-12" />
                    <Avatar v-else :label="item.siglas ||'S'"
                        :style="{ backgroundColor: item.color || '#000', color: '#fff' }" shape=""
                        class="md:w-12 md:h-12 text-xs md:text-base" />
                </span>
                <span class="md:text-lg">{{ item.nombre }}</span>
            </NuxtLink>
        </div>
    </Drawer>
</template>

<script setup>
const auth = useAuth()
const salonStore = useSalonStore();
const { GenerateSalaUrl } = useGenerateSalaUrl()
const menuSalasVisible = ref(false)
const toggleSalasMenu = () => {
    menuSalasVisible.value = true;
};

</script>