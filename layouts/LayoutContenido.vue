<template>
    <Onboarding/>
    <NotificacionesDialog ref="notificacionesDialog" />
    <header class="bg-zinc-100 sticky top-0 flex h-16 items-start z-50 px-4 md:px-6 transition-transform duration-300"
        :class="{ '-translate-y-full': !isHeaderVisible }">
        <FijarEntrada />

        <!-- Fixed Nav -->
        <nav class="w-full flex flex-row justify-between items-start mt-2">
            <MenuPrincipal/>

            <div class="flex h-12 items-center">
                <h1 class="text-lg font-semibold text-zinc-800">
                    <slot name="header" />
                </h1>
            </div>

            <MenuUsuario/>
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