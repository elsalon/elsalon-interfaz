<template>
      <header class="sticky top-0 flex h-16 items-center z-50 px-4 md:px-6">
        <nav class="w-full flex flex-row justify-between">
            <!-- Logo Salon -->
            <a href="/"><img class="h-12 w-12 " src="/public/salon_logo_sm_192x192.png"></a>
            
            <!-- Avatar Usuario -->
            <AvatarSalon class="cursor-pointer" v-if="data" :usuario="data?.user" @click="toggleUserMenu"/>
            <Menu ref="userMenu" id="overlay_menu" :model="items" :popup="true" /> 
        </nav>
       
      </header>
      <main class="container mx-auto">

        <slot />
      </main>
  </template>

<script setup>
    import { ref } from "vue";
    import { PrimeIcons } from '@primevue/core/api';
    const { data, signOut } = useAuth()

    const userMenu = ref();
    const items = ref([
        {
            label: data.value?.user?.nombre,
            items: [
                {
                    label: 'Cerrar Sesión',
                    icon: PrimeIcons.SIGN_OUT,
                    command: () => {
                        signOut({ callbackUrl: '/login' })
                    }
                }
            ]
        }
    ]);

    const toggleUserMenu = (event) => {
        userMenu.value.toggle(event);
    };
</script>