<template>
    <NuxtLayout name="layout-contenido">    
        <template #header>
            <RouterLink :to="`/`" class="link">S</RouterLink> /
            Docentes
        </template>
        

        <div class="prose dark:prose-invert my-10 break-words">
            Cada usuario del salón posee un rol, que por ahora sólo está determinado entre <strong>alumnx</strong> y <strong>docente</strong>.
            Por defecto los usuarios nuevos se les asigna el rol alumnx.
            <br><br>
            El rol docente posee algunas capacidades extra, con el objetivo de curar, proteger y promover el contenido dentro de <strong>el salón</strong>.
            También existe un rol admin reservado para las operaciones críticas de mantenimiento ya que tienen acceso irrestricto.
            
            <h3>Cómo obtener el rol docente</h3>
            Sólo un usuario docente puede otorgar o remover el rol docente a otro usuario. En la página de bitácora hay un menú de tres puntitos,
            que al desplegar muestra las opciones para administrar el estado de ese usuario.
            
            <video :src="vidOtorgarRolDocente" no-controls muted autoplay loop class="m-auto my-10"/>
            
            <h3>Qué hacer con el rol docente</h3>
            
            En todas las entradas ahora verás un menú desplegable con nuevas opciones
            <img :src="imgMenuDestacar" class="m-auto mt-4 max-w-60">
            <ul>
                <li><strong>Destacar en El Salón</strong> promueve una entrada que se considere de particular interés para que sea parte de la cronología
                    compartida de la página de inicio. 
                    <!-- La cronología principal se conforma de 
                        <ul>
                            <li>entradas del usuario</li>
                            <li>entradas de las salas a las que el usuario está enlazado</li>
                            <li>entradas de autores y grupos a las que el usuario está enalazado</li>
                            <li>entradas destacadas</li>
                        </ul> -->
                    <small><a href="https://github.com/elsalon/elsalon-servidor/blob/main/src/collections/Salones.ts#L142" target="_blank">Ver cómo se genera la cronología inicial</a></small>
                    
                </li>
                    <br>
                <li><strong>Fijar</strong> deja una entrada arriba de todo para dar más visibilidad. Para ayudar al orden
                    de cada salón, se incoroporó la opción de determinar cuánto tiempo debería quedar fijada. Luego de ese tiempo vuelve a su cronología normal.</li>
                    <video :src="vidFijarEntrada" no-controls muted autoplay loop class="m-auto my-10"/>
            </ul>

            <h3>Eventos</h3>
            El Salón tiene un sistema de agenda para agregar eventos. Solicitar a un admin que lo active si no lo ven. En la vista de cada salón se listarán 
                arriba de todo los próximos 4 eventos futuros. Se puede ingresar a la agenda para tener un panorama de todo el calendario anual.<br>
                <img :src="imgEventosSalon" class="m-auto my-10 max-w-lg">
            Para agregar un nuevo evento clickear en la fecha del calendario y completar los datos, con el título, una descripción (este puede ser un buen lugar 
            para poner la consigna o aspectos a ser evaluados) y la fecha + hora. Los eventos listados tienen un ícono de lápiz para editar, y un tacho para eliminar. 
            Sólo los usuarios con rol docente pueden agregar/editar/eliminar eventos.
            
            <video :src="vidEventoCrear" no-controls muted autoplay loop class="m-auto my-10"/>
            
            <h3>Comisión</h3>
            Los docentes también pueden crear o eliminar comisiones dentro de cada sala, mientras que los usuarios no docentes sólo pueden consultar la lista de comisiones 
            y unirse a una. <strong>Los espacios dentro de las comisiones sólo sirven como un filtro,</strong> no son sub espacios para escribir. El 
            <a href="https://github.com/elsalon/elsalon-servidor/blob/main/src/collections/ComisionesEndpoints.js#L113" target="_blank">filtro</a> revela todas las 
            entradas de sus integrantes en ese espacio o su bitácora como también la de grupos cuyos integrantes estén en la comisión.
            <div class="bg-zinc-200 text-zinc-600 my-2 p-2 text-center text-xs">
                Esta vista todavía está en proceso así que puede fallar o decidamos quitarla
            </div>

            <h3>Aulas</h3>
            Cada salón tiene un espacio bajo su nombre como un lugar para comunicar información rápidamente, como por ejemplo las aulas que vamos a usar cada jornada. 
            Para editar solo hay que clickearlo y se convierte en un caja de texto. Al terminar la edición
            clickear en la tilde para guardar.

            <video :src="vidAulas" no-controls muted autoplay loop class="m-auto my-10"/>
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
salonStore.SetPageTitle(`Docente`)
</script>