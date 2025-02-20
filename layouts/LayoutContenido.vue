<template>
    <header class="bg-white sticky top-0 flex h-16 items-center z-50 px-4 md:px-6 transition-transform duration-300"
        :class="{ '-translate-y-full': !isHeaderVisible }">
        <FijarEntrada />

        <!-- Fixed Nav -->
        <nav class="w-full flex flex-row justify-between items-center">
            <!-- Logo Salon -->
            <!-- <Avatar v-if="paginaActual?.avatar" :image="paginaActual.avatar.sizes.medium.url" size="large" shape="" class="select-none cursor-pointer" @click="toggleSalonesMenu"/>
            <Avatar v-else :label="paginaActual?.siglas" class="select-none cursor-pointer" :style="{backgroundColor: paginaActual.color, color: '#fff'}" size="large" shape="" @click="toggleSalonesMenu"/> -->
            <Avatar label="☰" class="select-none cursor-pointer bg-black text-white" size="large" shape=""
                @click="toggleSalonesMenu" />
            <Drawer v-model:visible="menuSalonesVisible" class="!w-full md:!w-80 lg:!w-[30rem]">

                <!-- Widget Busqueda -->
                <div class="mb-3">
                    <CajaBusqueda />
                </div>

                <div v-for="item in salonStore.salones" class="ml-1 lista-salones">
                    <NuxtLink :to="GenerateUrl(item.slug)" class="flex items-center mb-1 hover:font-bold">
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
                    <template v-if="notificacionesStore.nuevas > 0">
                        <OverlayBadge>
                            <AvatarSalon :key="'avt' + myKey" class="cursor-pointer" :usuario="auth?.data.value.user"
                                @click="toggleUserMenu" />
                        </OverlayBadge>
                    </template>
                    <!-- Avatar Sin notificationes -->
                    <template v-else>
                        <AvatarSalon :key="'avt' + myKey" class="cursor-pointer -right-px"
                            :usuario="auth?.data.value.user" @click="toggleUserMenu" />
                    </template>
                </template>

                <Menu ref="userMenu" id="overlay_menu" :model="itemsUserMenu" :popup="true">
                    <template #item="{ item, props }">
                        <a class="flex items-center" v-bind="props.action">
                            <span :class="item.icon" class="mr-2" />
                            <span>{{ item.label }} </span>
                            <Badge size="small" v-if="item.badge > 0" class="ml-auto" :value="item.badge" />
                            <span v-if="item.shortcut"
                                class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1">{{
            item.shortcut }}</span>
                        </a>
                    </template>
                </Menu>
            </div>
        </nav>
    </header>
    <main :class="containerType">
        <VideoPlaylist/>
        <slot />
    </main>
    <NotificacionesDialog ref="notificacionesDialog" />
</template>

<script setup>
const { isHeaderVisible } = useScrollDirection(75)
const notificacionesStore = useNotificacionesStore()
const { myKey } = useReactiveAuth()
const auth = useAuth()
import { PrimeIcons } from '@primevue/core/api';
const salonStore = useSalonStore();
const notificacionesDialog = ref();

const toast = useToast();
import { useToast } from "primevue/usetoast";

defineProps({
    containerType: {
        type: String,
        default: 'container-small'
    }
});

watchEffect(() => {
    const notifications = notificacionesStore.nuevas > 0 ? `(${notificacionesStore.nuevas}) ` : '';
    const title = salonStore.pageTitle ? `${salonStore.pageTitle} - Salón` : 'Salón';
    useHead({
        title: notifications + title
    });
});

// listen for notificacionesNuevas change
watch(() => notificacionesStore.nuevas, (val, oldVal) => {
    console.log('Nuevas notificaciones', val, oldVal)
    if (oldVal != null && val > 0) {
        // No es el primer fetch y hay nuevas notificaciones
        toast.add({ severity: 'contrast', detail: 'Tenés nuevas notificaciones', life: 3000 });
        // Check if window is focused
        if (document.hidden) {
            AbrirNotificacionNavegador();
        }
    }
});

const AbrirNotificacionNavegador = () => {
    if (Notification.permission === 'granted') {
        new Notification('El Salón', {
            body: 'Tenés nuevas notificaciones',
            icon: '/favicon.ico',
        }).onclick = () => {
            // Focus the tab
            window.focus();
            // Abrir notificaciones
            notificacionesStore.dialogVisible = true;
        }
    }
}

const GenerateUrl = (slug) => {
    if (slug == 'el-salon') {
        return '/';
    }
    return `/salones/${slug}`;
}

const userMenu = ref();
const itemsUserMenu = computed(() => [
    {
        label: auth?.data?.value.user.nombre,
        items: [
            {
                label: 'Notificaciones',
                icon: PrimeIcons.BELL,
                command: () => {
                    // Abrir drawer de notificaciones?
                    notificacionesStore.dialogVisible = true;
                    // console.log(notificacionesDialog.value)
                },
                badge: notificacionesStore.nuevas
            },
            {
                label: 'Bitácora',
                icon: PrimeIcons.BOOK,
                command: () => {
                    navigateTo('/usuarios/' + auth?.data.value.user.slug)
                }
            },
            {
                label: 'Grupos',
                icon: PrimeIcons.USERS,
                command: () => {
                    navigateTo('/opciones/grupos')
                },
            },
            // {
            //     label: 'Búsqueda',
            //     icon: PrimeIcons.SEARCH,
            //     command: () => {
            //         navigateTo('/busqueda')
            //     }
            // },
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

if (auth?.data.value.user.isAdmin) {
    itemsUserMenu.value[0].items.push({
        label: 'Admin El Salón',
        icon: PrimeIcons.WRENCH,
        command: () => {
            navigateTo('/admin', { external: true, target: '_blank' })
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