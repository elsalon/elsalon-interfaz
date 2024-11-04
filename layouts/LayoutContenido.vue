<template>
    <header class="bg-white sticky top-0 flex h-16 items-center z-50 px-4 md:px-6 transition-transform duration-300" 
    :class="{ '-translate-y-full': !isHeaderVisible }">
        <!-- Fixed Nav -->
        <nav class="w-full flex flex-row justify-between items-center">
            <!-- Logo Salon -->
            <Avatar v-if="paginaActual?.avatar" :image="paginaActual.avatar.sizes.medium.url" size="large" shape="" class="select-none cursor-pointer" @click="toggleSalonesMenu"/>
            <Avatar v-else :label="paginaActual?.siglas" class="select-none cursor-pointer" :style="{backgroundColor: paginaActual.color, color: '#fff'}" size="large" shape="" @click="toggleSalonesMenu"/>

            <Menu ref="salonesMenu" id="overlay_menu_salones" :model="salonStore.salones" :popup="true" class="select-none"> 
                <template #item="{ item, props }">
                    <router-link v-if="item.slug" v-slot="{ href, navigate }" :to="GenerateUrl(item.slug)" custom>
                        <a :href="href" v-bind="props.action" @click="navigate">
                            <span class="mr-2">
                                <Avatar v-if="item?.avatar" :image="item.avatar.sizes.medium.url" shape="circle"/>
                                <Avatar v-else :label="item.siglas" :style="{backgroundColor: item.color, color: '#fff'}" shape="circle" />
                            </span>
                            <span>{{ item.nombre }}</span>                        
                        </a>
                    </router-link>
                </template>
            </Menu>
            
            <div class="flex items-center">
                <h1 class="text-lg font-semibold text-gray-800">
                    <slot name="header" />
                </h1>
            </div>
            
            <!-- Avatar Usuario -->
            <div style="width:48px">
            <client-only>
                <template v-if="authData">
                    <!-- Avatar Con notificationes -->
                    <template v-if="totalNotifications > 0">
                        <OverlayBadge :value="totalNotifications" size="small">
                            <AvatarSalon :key="'avt'+myKey" class="cursor-pointer" :usuario="authData" @click="toggleUserMenu"/>
                        </OverlayBadge>
                    </template>
                    <!-- Avatar Sin notificationes -->
                    <template v-else>
                        <AvatarSalon :key="'avt'+myKey" class="cursor-pointer -right-px" :usuario="authData" @click="toggleUserMenu"/>
                    </template>
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
            </div>
        </nav>
    </header>
    <main class="container mx-auto">
        <slot />
    </main>
    <NotificacionesDialog v-model:visible="notificacionesVisible" ref="notificacionesDialog" />
</template>

<script setup>
    const { isHeaderVisible } = useScrollDirection(75)
    const { totalNotifications } = useNotifications()
    const { authData, myKey } = useReactiveAuth()
    const {signOut} = useAuth()
    import { PrimeIcons } from '@primevue/core/api';
    // const authData = computed(() => useAuth().data)
    const { paginaActual } = useSalon()
    const salonStore = useSalonStore();
    const notificacionesVisible = ref(false);
    const notificacionesDialog = ref();

    const toast = useToast();
    import { useToast } from "primevue/usetoast";

    watchEffect(() => {
        const notifications = totalNotifications.value > 0 ? `(${totalNotifications.value}) ` : '';
        const title = salonStore.pageTitle ?  `${salonStore.pageTitle} - Salón` : 'Salón';
        useHead({
            title: notifications + title
        });
    });

    // listen for totalNotifications change
    let firstRun = true;
    watch(totalNotifications, (val) => {
        if(val > 0){
            if(firstRun){
                firstRun = false;
                return;
            }
            console.log('Nuevas notificaciones', val)
            toast.add({ severity: 'contrast', detail: 'Tenés nuevas notificaciones', life: 3000});
        }
    });

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
                        notificacionesVisible.value = true;
                        // console.log(notificacionesDialog.value)
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
                },
                {
                    label: 'Búsqueda',
                    icon: PrimeIcons.SEARCH,
                    command: () => {
                        navigateTo('/busqueda')
                    }
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
                },
            ]
        }
    ]);

    if(authData?.value?.isAdmin){
        itemsUserMenu.value[0].items.push({
            label: 'Admin El Salón',
            icon: PrimeIcons.WRENCH,
            command: () => {
                navigateTo('/admin')
            }
        })
    }

    const toggleUserMenu = (event) => {
        userMenu.value.toggle(event);
    };


    const salonesMenu = ref();
    const toggleSalonesMenu = (event) => {
        salonesMenu.value.toggle(event);
    };
</script>