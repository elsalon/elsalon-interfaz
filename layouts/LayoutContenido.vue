<template>
    <header class="sticky top-0 flex h-16 items-center z-50 px-4 md:px-6">
        <!-- Fixed Nav -->
        <nav class="w-full flex flex-row justify-between items-center">
            <!-- Logo Salon -->
            <!-- <img class="h-12 w-12 " src="/public/salon_logo_sm_192x192.png"  @click="toggleSalonesMenu"> -->
            <Avatar :label="paginaActual.siglas" class="cursor-pointer" :style="{backgroundColor: paginaActual.color, color: '#fff'}" size="large" shape=""  @click="toggleSalonesMenu"/>
            
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
    const route = useRoute()
    const elsalon = useSalonStore();

    const slug = route.params?.slug || 'el-salon'; // TODO algo que no lo haga hardcodeado
    const paginaActual = ref(elsalon.salones.find(s => s.slug === slug));
    console.log("paginaActual",paginaActual)

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