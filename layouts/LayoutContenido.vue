<template>
    <header class="bg-white sticky top-0 flex h-16 items-center z-50 px-4 md:px-6 transition-transform duration-300" 
    :class="{ '-translate-y-full': !isHeaderVisible }">
        <FijarEntrada />
        
        <!-- Fixed Nav -->
        <nav class="w-full flex flex-row justify-between items-center">
            <!-- Logo Salon -->
            <!-- <Avatar v-if="paginaActual?.avatar" :image="paginaActual.avatar.sizes.medium.url" size="large" shape="" class="select-none cursor-pointer" @click="toggleSalonesMenu"/>
            <Avatar v-else :label="paginaActual?.siglas" class="select-none cursor-pointer" :style="{backgroundColor: paginaActual.color, color: '#fff'}" size="large" shape="" @click="toggleSalonesMenu"/> -->
            <Avatar label="☰" class="select-none cursor-pointer bg-black text-white" size="large" shape="" @click="toggleSalonesMenu"/>
            <Drawer v-model:visible="menuSalonesVisible" class="!w-full md:!w-80 lg:!w-[30rem]">
                <div v-for="item in salonStore.salones" class="ml-1">
                    <NuxtLink :to="GenerateUrl(item.slug)" class="flex items-center mb-1 hover:font-bold">
                        <span class="mr-2">
                            <Avatar v-if="item?.avatar" :image="item.avatar.sizes.medium.url" shape="" class="md:w-12 md:h-12"/>
                            <Avatar v-else :label="item.siglas" :style="{backgroundColor: item.color || '#000', color: '#fff'}" shape="" class="md:w-12 md:h-12"/>
                        </span>
                        <span class="md:text-lg">{{ item.nombre }}</span>
                    </NuxtLink>
                </div>
            </Drawer>
            
            <div class="flex items-center">
                <h1 class="text-lg font-semibold text-gray-800">
                    <slot name="header" />
                </h1>
            </div>
            
            <!-- Avatar Usuario -->
            <div style="width:48px">
                <!-- {{ auth?.data.value.user.nombre }} -->
            
                <template v-if="auth?.data">
                    <!-- Avatar Con notificationes -->
                    <template v-if="totalNotifications > 0">
                        <OverlayBadge :value="totalNotifications" size="small">
                            <AvatarSalon :key="'avt'+myKey" class="cursor-pointer" :usuario="auth?.data.value.user" @click="toggleUserMenu"/>
                        </OverlayBadge>
                    </template>
                    <!-- Avatar Sin notificationes -->
                    <template v-else>
                        <AvatarSalon :key="'avt'+myKey" class="cursor-pointer -right-px" :usuario="auth?.data.value.user" @click="toggleUserMenu"/>
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
            </div>
        </nav>
    </header>
    <main :class="containerType">
        <slot />
    </main>
    <NotificacionesDialog v-model:visible="notificacionesVisible" ref="notificacionesDialog" />
</template>

<script setup>
    const { isHeaderVisible } = useScrollDirection(75)
    const { totalNotifications } = useNotifications()
    const { myKey } = useReactiveAuth()
    const auth = useAuth()
    import { PrimeIcons } from '@primevue/core/api';
    const salonStore = useSalonStore();
    const notificacionesVisible = ref(false);
    const notificacionesDialog = ref();

    const toast = useToast();
    import { useToast } from "primevue/usetoast";

    defineProps({
        containerType:{
            type: String,
            default: 'container-small'
        }
    });

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
            label: auth?.data?.value.user.nombre,
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
                        navigateTo('/usuarios/'+ auth?.data.value.user.slug)
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
                        auth.signOut({ callbackUrl: '/login' })
                    }
                },
            ]
        }
    ]);

    if(auth?.data.value.user.isAdmin){
        itemsUserMenu.value[0].items.push({
            label: 'Admin El Salón',
            icon: PrimeIcons.WRENCH,
            command: () => {
                navigateTo('/admin')
            }
        })
    }

    const menuSalonesVisible = ref(false)

    const toggleUserMenu = (event) => {
        userMenu.value.toggle(event);
    };
    
    
    const salonesMenu = ref();
    const toggleSalonesMenu = (event) => {
        menuSalonesVisible.value = true;
        // salonesMenu.value.toggle(event);
    };
</script>