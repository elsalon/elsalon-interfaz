<template>
      <header class="sticky top-0 flex h-16 items-center z-50 px-4 md:px-6">
        <!-- Fixed Nav -->
        <nav class="w-full flex flex-row justify-between items-center">
            <!-- Logo Salon -->
            <img class="h-12 w-12 " src="/public/salon_logo_sm_192x192.png"  @click="toggleSalonesMenu">
            <Menu ref="salonesMenu" id="overlay_menu_salones" :model="elsalon.salones" :popup="true"> 
                <template #item="{ item, props }">
                    <router-link v-if="item.slug" v-slot="{ href, navigate }" :to="'/salones/'+item.slug" custom>
                        <a v-ripple :href="href" v-bind="props.action" @click="navigate">
                            <span class="mr-2">
                                <Avatar :label="item.siglas" :style="{backgroundColor: item.color, color: '#fff'}" shape="circle" />
                            </span>
                            <span>{{ item.nombre }}</span>                        
                        </a>
                    </router-link>
                </template>
            </Menu>

            <!-- Salones -->
            <!-- <ul class="flex space-x-0">
                <li v-for="salon in elsalon.salones" :key="salon.id">
                    <a :href="`/salon/${salon.slug}`">
                        <Avatar :label="salon.siglas" class="mr-2" size="large" :style="{backgroundColor: salon.color, color: '#fff'}" shape="circle" />
                    </a>
                </li>
            </ul> -->
            
            <!-- Avatar Usuario -->
            <AvatarSalon class="cursor-pointer" v-if="data" :usuario="data?.user" @click="toggleUserMenu"/>
            <Menu ref="userMenu" id="overlay_menu" :model="itemsUserMenu" :popup="true" /> 
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

    const elsalon = useSalonStore();

    const userMenu = ref();
    const itemsUserMenu = ref([
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


    const salonesMenu = ref();
    const toggleSalonesMenu = (event) => {
        salonesMenu.value.toggle(event);
    };
</script>