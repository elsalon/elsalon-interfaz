<template>
    <template v-if="auth?.data">
        <Button @click="toggleTheme" :icon="themeIcon" text class="dark:text-zinc-300" :title="colorMode.preference" />
        <!-- Avatar Con notificationes -->
        <template v-if="notificacionesStore.nuevas > 0">
            <OverlayBadge severity="contrast">
                <AvatarSalon :key="'avt' + myKey" class="cursor-pointer -right-px" :usuario="auth?.data.value.user"
                    @click="toggleUserMenu" />
            </OverlayBadge>
        </template>
        <!-- Avatar Sin notificationes -->
        <template v-else>
            <AvatarSalon :key="'avt' + myKey" class="cursor-pointer -right-px" :usuario="auth?.data.value.user"
                @click="toggleUserMenu" />
        </template>
    </template>

    <Menu ref="userMenu" id="overlay_menu" :model="itemsUserMenu" :popup="true">
        <template #item="{ item, props }">
            <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
                <a :href="href" v-bind="props.action" @click="navigate">
                    <span :class="item.icon" />
                    <span class="ml-2">{{ item.label }}</span>
                </a>
            </router-link>
            <a v-else class="flex items-center" v-bind="props.action">
                <span :class="item.icon" class="mr-2" />
                <span>{{ item.label }} </span>
                <Badge size="small" severity="contrast" v-if="item.badge > 0" class="ml-auto" :value="item.badge" />
                <span v-if="item.shortcut"
                    class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1">{{
        item.shortcut }}</span>
            </a>
        </template>
    </Menu>
</template>

<script setup>
const salonStore = useSalonStore();
const notificacionesStore = useNotificacionesStore()
const { myKey } = useReactiveAuth()
const auth = useAuth()
import { PrimeIcons } from '@primevue/core/api';
import { useToast } from "primevue/usetoast";
const toast = useToast();
const colorMode = useColorMode();

let saveThemeTimeout = null;

const saveThemeToDatabase = async (theme) => {
    try {
        const user = auth.data.value.user;
        await useAPI(`/api/users/${user.id}`, {
            body: {
                opciones: {
                    theme: theme
                }
            },
            method: 'PATCH'
        });
        await auth.getSession();
    } catch (e) {
        console.error('Error saving theme preference:', e);
    }
};

const themeIcon = computed(() => {
    const theme = colorMode.preference;
    if (theme === 'dark') return PrimeIcons.MOON;
    if (theme === 'light') return PrimeIcons.SUN;
    return PrimeIcons.DESKTOP;
});

const toggleTheme = () => {
    const themes = ['system', 'light', 'dark'];
    const currentIndex = themes.indexOf(colorMode.preference);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    
    colorMode.preference = nextTheme;
    
    // Clear previous timeout
    if (saveThemeTimeout) {
        clearTimeout(saveThemeTimeout);
    }
    
    // Debounce save to database
    saveThemeTimeout = setTimeout(() => {
        saveThemeToDatabase(nextTheme);
    }, 1000);
};

// listen for notificacionesNuevas change
watch(() => notificacionesStore.nuevas, (val, oldVal) => {
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


const toggleUserMenu = (event) => {
    userMenu.value.toggle(event);
};

const userMenu = ref();
const itemsUserMenu = computed(() => [
    {
        label: auth?.data?.value.user.nombre,
        items: [
            {
                label: 'Notificaciones',
                icon: PrimeIcons.BELL,
                command: () => {
                    // Abrir drawer de notificaciones
                    notificacionesStore.dialogVisible = true;
                },
                badge: notificacionesStore.nuevas
            },
            {
                label: 'Bitácora',
                icon: PrimeIcons.BOOK,
                route: `/usuarios/${auth?.data.value.user.slug}`
            },
            {
                label: 'Grupos',
                icon: PrimeIcons.USERS,
                route: '/opciones/grupos',
            },
            {
                label: 'Ayuda',
                icon: PrimeIcons.QUESTION_CIRCLE,
                route: '/nodo/ayuda'
            },
            {
                label: 'Opciones',
                icon: PrimeIcons.COG,
                route: '/opciones'
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



watchEffect(() => {
    const notifications = notificacionesStore.nuevas > 0 ? `(${notificacionesStore.nuevas}) ` : '';
    const title = salonStore.pageTitle ? `${salonStore.pageTitle} - Salón` : 'Salón';
    useHead({
        title: notifications + title
    });
});


</script>