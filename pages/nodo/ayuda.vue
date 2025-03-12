<template>
    <NuxtLayout name="layout-contenido">    
        <template #header>
            <RouterLink :to="`/`" class="link">S</RouterLink> /
            Ayuda
        </template>
        

        <div class="prose my-10 break-words">

            <p>El Salón es una plataforma impulsada por la cátedra Campos/Trilnick de la carrera Diseño de Imagen y Sonido en la FADU, UBA
                para abrir un canal de comunicación para visualización, devolución y entrega de proyectos entre docentes y alumnos</p>
                
            <p>El proyecto es de <strong>código abierto</strong> a la comunidad. Está abierto a que cualquiera pueda instalarlo, usarlo, experimentar y colaborar.</p>
            
            <div class="w-full text-center my-10">
                <Button icon="pi pi-github" label="Ver Código" severity="secondary" as="a" target="_blank" rel="noopener" href="https://github.com/elsalon" />
            </div>

            <p>Esta página enumera las características principales comunes para todos lxs usuarixs. Para ver las capacidades de otros roles consultá <RouterLink to="/nodo/docente">rol docente</RouterLink>.</p>


            <onboardingFeedSalas class="my-10"/>

            <onboardingFeedSalones class="my-10"/>

            <onboardingFeedBitacora class="my-10"/>

            <onboardingGrupos class="my-10"/>
        </div>

    </NuxtLayout>

</template>

<script setup>

const salonStore = useSalonStore();
salonStore.SetPageTitle(`Ayuda`)
</script>