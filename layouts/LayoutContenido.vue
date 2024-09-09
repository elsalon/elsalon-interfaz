<template>
    <header class="sticky top-0 flex h-16 items-center z-50 px-4 md:px-6">
        <!-- Fixed Nav -->
        <nav class="w-full flex flex-row justify-between items-center">
            <!-- Logo Salon -->
            <Avatar :label="paginaActual?.siglas" class="cursor-pointer" :style="{backgroundColor: paginaActual.color, color: '#fff'}" size="large" shape=""  @click="toggleSalonesMenu"/>
            
            <Menu ref="salonesMenu" id="overlay_menu_salones" :model="elsalon.salones" :popup="true"> 
                <template #item="{ item, props }">
                    <router-link v-if="item.slug" v-slot="{ href, navigate }" :to="GenerateUrl(item.slug)" custom>
                        <a v-ripple :href="href" v-bind="props.action" @click="navigate">
                            <span class="mr-2">
                                <Avatar :label="item.siglas" :style="{backgroundColor: item.color, color: '#fff'}" shape="circle" />
                            </span>
                            <span>{{ item.nombre }}</span>                        
                        </a>
                    </router-link>
                </template>
            </Menu>
            
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
    const { paginaActual } = useSalon()
    const elsalon = useSalonStore();

    const GenerateUrl = (slug) => {
        if(slug == 'el-salon'){
            return '/';
        }
        return `/salones/${slug}`;
    }

    const userMenu = ref();
    const itemsUserMenu = ref([
        {
            label: data.value?.user?.nombre,
            items: [
                {
                    label: 'Bitácora',
                    icon: PrimeIcons.BOOK,
                    command: () => {
                        navigateTo('/usuario/'+ data.value.user.slug)
                    }
                },
                {
                    label: 'Grupos',
                    icon: PrimeIcons.USERS,
                    command: () => {
                        navigateTo('/grupos')
                    }
                },
                {
                    label: 'Configuración',
                    icon: PrimeIcons.COG,
                    command: () => {
                        navigateTo('/perfil')
                    }
                },
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