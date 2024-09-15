<template>
    <DataLoader>
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
                <client-only>
                    <!-- Avatar Con notificationes -->
                    <template v-if="totalNotifications > 0">
                        <OverlayBadge :value="totalNotifications" size="small">
                            <AvatarSalon :key="'avt'+myKey" class="cursor-pointer" v-if="authData" :usuario="authData" @click="toggleUserMenu"/>
                        </OverlayBadge>
                    </template>
                    <!-- Avatar Sin notificationes -->
                    <template v-else>
                        <AvatarSalon :key="'avt'+myKey" class="cursor-pointer" v-if="authData" :usuario="authData" @click="toggleUserMenu"/>
                    </template>
                    
                    <Menu ref="userMenu" id="overlay_menu" :model="itemsUserMenu" :popup="true"> 
                        <template #item="{ item, props }">
                            <a class="flex items-center" v-bind="props.action">
                                <span :class="item.icon" class="mr-2" />
                                <span>{{ item.label }} </span>
                                <Badge size="small" v-if="item.badge > 0" class="ml-auto" :value="item.badge" />
                                <span v-if="item.shortcut" class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1">{{ item.shortcut }}</span>
                            </a>
                        </template>
                    </Menu>
                </client-only>
            </nav>
        </header>
        <main class="container mx-auto">
            <slot />
        </main>
    </DataLoader>
</template>

<script setup>
    const { notifications, totalNotifications } = useNotifications()
    const { authData, myKey } = useReactiveAuth()
    const {signOut} = useAuth()
    import { PrimeIcons } from '@primevue/core/api';
    // const authData = computed(() => useAuth().data)
    const { paginaActual } = useSalon()
    const elsalon = useSalonStore();

    const GenerateUrl = (slug) => {
        if(slug == 'el-salon'){
            return '/';
        }
        return `/salones/${slug}`;
    }

    const userMenu = ref();
    const itemsUserMenu = computed(()=>[
        {
            label: authData?.value?.nombre,
            items: [
                {
                    label: 'Notificaciones',
                    icon: PrimeIcons.BELL,
                    command: () => {
                        // Abrir drawer de notificaciones?
                    },
                    badge: totalNotifications.value
                },
                {
                    label: 'Bitácora',
                    icon: PrimeIcons.BOOK,
                    command: () => {
                        navigateTo('/usuarios/'+ authData?.value.slug)
                    }
                },
                {
                    label: 'Grupos',
                    icon: PrimeIcons.USERS,
                    command: () => {
                        navigateTo('/opciones/grupos')
                    },
                    separator: true
                },
                {
                    label: 'Opciones',
                    icon: PrimeIcons.COG,
                    command: () => {
                        navigateTo('/opciones/perfil')
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