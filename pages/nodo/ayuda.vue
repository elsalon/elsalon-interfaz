<template>
    <NuxtLayout name="layout-contenido">    
        <template #header>
            <RouterLink :to="`/`" class="link">S</RouterLink> /
            Ayuda
        </template>
        

        <div class="prose my-10 break-words">
            <onboardingBienvenida/>

            <div class="w-full text-center my-10">
                <Button icon="pi pi-github" label="Ver Código" severity="secondary" as="a" target="_blank" rel="noopener" href="https://github.com/elsalon" />
            </div>

            <onboardingFeedElsalon class="my-10"/>

            <onboardingFeedSalones class="my-10"/>

            <onboardingFeedBitacora class="my-10"/>

            <onboardingGrupos class="my-10"/>
        </div>

    </NuxtLayout>

</template>

<script setup>
import onboardingBienvenida from "~/components/onboarding/onboarding-bienvenida.vue";
import onboardingFeedElsalon from "~/components/onboarding/onboarding-feed-elsalon.vue";
import onboardingFeedSalones from "~/components/onboarding/onboarding-feed-salones.vue";
import onboardingFeedBitacora from "~/components/onboarding/onboarding-feed-bitacora.vue";
import onboardingGrupos from "~/components/onboarding/onboarding-grupos.vue";

const salonStore = useSalonStore();
salonStore.SetPageTitle(`Ayuda`)
</script>