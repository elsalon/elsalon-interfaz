<template>
    <NuxtLayout name="layout-contenido">    
        <template #header>
            <RouterLink :to="`/`" class="link">S</RouterLink> /
            Ayuda
        </template>
        

        <div class="prose  my-10 break-words">
            <p>El Salón es una plataforma impulsada por la cátedra Campos/Trilnick de la carrera Diseño de Imagen y Sonido en la FADU, UBA
             para abrir un canal de comunicación para visualización, devolución y entrega de proyectos entre docentes y alumnos</p>

            <p>El proyecto es de <strong>código abierto</strong> a la comunidad. Está abierto a que cualquiera pueda replicarlo en sus servidores y hacer pull requests.
                Se trabaja continuamente en mejorar la documentación y guía de pasos para su uso.</p>
                <div class="w-full text-center">
                    <Button icon="pi pi-github" label="Ver Código" severity="secondary" as="a" target="_blank" rel="noopener" href="https://github.com/elsalon" />
                </div>

            <p>...</p>
        </div>

    </NuxtLayout>

</template>

<script setup>
import vidOtorgarRolDocente from "./docente-assets/1-otorgar-rol-docente.mp4"
import imgMenuDestacar from "./docente-assets/menu-destacar.png"
import imgEventosSalon from "./docente-assets/eventos-salon.png"
import vidFijarEntrada from "./docente-assets/2-fijar-entrada.mp4"
import vidEventoCrear from "./docente-assets/3-crear-evento.mp4"
import vidAulas from "./docente-assets/4-aulas.mp4"
const salonStore = useSalonStore();
salonStore.SetPageTitle(`Ayuda`)
</script>