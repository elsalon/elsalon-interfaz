<template>
      <header class="sticky top-0 flex h-16 items-center z-50 px-4 md:px-6">
        <nav class="w-full flex flex-row justify-between">
            <a href="/"><img class="h-12 w-12 " src="/public/salon_logo_sm_192x192.png"></a>
            <!-- {{ data.user }} -->
            <!-- <OverlayBadge value="4" severity="danger" class="inline-flex"> -->
                <!-- <Avatar :image="avatarUsuario" label="GM" size="large" class="mr-2" style="background-color: #000; color: #fff" /> -->
                 <AvatarSalon v-if="data" :usuario="data?.user"/>
            <!-- </OverlayBadge> -->
            <!-- <div class="relative" @click="toggleUserMenu">
                <img class="h-10 w-10 object-cover rounded-full" :src="avatarUsuario" alt="Avatar">
                <div class="absolute inset-0 rounded-full"></div>
                <Menu ref="userMenu" id="overlay_menu" :model="items" :popup="true" /> -->
            <!-- </div> -->
            
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