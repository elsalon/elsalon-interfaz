<template>
    <Onboarding/>
    <NotificacionesDialog ref="notificacionesDialog" />
    <header class="salon-bg sticky top-0 flex h-16 items-start z-50 px-4 md:px-6 transition-transform duration-300"
        :class="{ '-translate-y-full': !isHeaderVisible }">
        <FijarEntrada />

        <!-- Fixed Nav -->
        <nav class="w-full grid grid-cols-3 items-start mt-2 gap-4">
            <div class="flex justify-start">
                <MenuPrincipal/>
            </div>

            <div class="flex items-center justify-center self-center">
                <h1 class="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                    <slot name="header" />
                </h1>
            </div>

            <div class="flex justify-end">
                <MenuUsuario/>
            </div>
        </nav>
    </header>
    <main :class="containerType">
        <VideoPlaylist/>
        <slot />
    </main>
    
</template>

<script setup>
const { isHeaderVisible } = useScrollDirection(75)

defineProps({
    containerType: {
        type: String,
        default: 'container-small'
    }
});


</script>