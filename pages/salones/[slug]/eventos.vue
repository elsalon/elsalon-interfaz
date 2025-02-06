<template>
    <NuxtLayout name="layout-contenido">
        <template #header>
            <RouterLink :to="`/`" class="link">S</RouterLink> /
            <NuxtLink :to="`/salones/${salon.slug}`" class="link">{{ salon.siglas }}</NuxtLink> / Eventos
        </template>

        <div class="text-center mb-2">
            <LogoSala :salon="salon" />
            <NuxtLink class="text-3xl font-bold" :to="`/salones/${salon.slug}`">
                <h1>{{ salon.nombre }}</h1>
            </NuxtLink>

            <!-- <BtnListaComisiones :salon="salon" :periodo="periodo"/>
            <BtnListaArchivo v-if="salon.archivo.activar" :salon="salon"/> -->
            <div class="flex flex-col md:flex-row space-x-2">

                <client-only>
                    <VCalendar id="calendar" ref="calendar" :view="calendarView" 
                        class="transition-padding duration-300 z-10" :class="{'pt-16': isHeaderVisible && calendarView == 'weekly'}"
                        borderless :rows="rows" :expanded="expanded" :masks="masks"
                        :attributes="attributes" locale="es" :min-date="periodo.startDate"
                        :max-date="periodo.endDate" :initial-page="initialPage" @dayclick="onDayClicked"
                        @daymouseenter="onDayMouseEnter" @daymouseleave="onDayMouseLeft" @did-move="onDidMove"
                        @update:pages="onUpdatePages"
                        >
                    </VCalendar>

                    <div class="md:mt-9 md:w-full">
                        <template v-if="eventos.docs.length == 0">
                            <div class="text-center text-gray-500 text-sm">Clickeá en una fecha para crear el primer evento</div>
                        </template>
                        <template v-else>
                            <div v-if="!fechasVisibles.length" class="text-center text-gray-500 text-sm">
                                No hay eventos en este periodo</div>
                        </template>
                        <div v-for="evento in fechasVisibles" :key="evento.id" :ref="el => evtRefs[evento.id] = el"
                            class="p-2 mb-2 text-left hover:cursor-pointer"
                            :class="{ 'bg-orange-50': eventoIdHovered == evento.id, 'text-gray-400': evento.pasado, 'opacity-30': evento.loading }"
                            @click="focusEvento(evento)" @mouseleave="eventoIdHovered = null">
                            <div class="flex">
                                <div class="text-lg font-semibold flex-grow">{{ evento.titulo }}</div>
                                <!-- Btn Comenzar Editar -->
                                 <div class="event-actions flex">
                                        <Button v-if="puedeEditar" icon="pi pi-trash" severity="danger" text rounded aria-label="Filter"  @click="PromptEliminarEvento(evento)"/>
                                        <Button v-if="puedeEditar" icon="pi pi-pencil"  text rounded aria-label="Filter"  @click="ComenzarEditarEvento(evento)"/>
                                 </div>
                            </div>
                            <div class="text-xs md:text-sm text-gray-500">{{ $formatDateCorto(evento.fecha) }}</div>
                            <div class="text-sm md:text-base">{{ evento.descripcion }}</div>
                        </div>
                    </div>
                </client-only>
            </div>
        </div>

        <!-- Ventana Crear / Editar evento -->
        <Dialog v-model:visible="mostrarVentanaEdit" modal :header="ventanaEditHeader" :style="{ width: '25rem' }">
            
            <div class="flex gap-2 mb-4 flex-col md:flex-row">
                <label for="fecha" class="font-semibold w-1/4">fecha</label>
                <DatePicker dateFormat="dd/mm/yy" id="fecha" v-model="eventoEditando.fecha" class="w-full" :minDate="periodo.startDate" :maxDate="periodo.endDate" showTime hourFormat="24" fluid />
            </div>

            <div class="flex gap-2 mb-4 flex-col md:flex-row">
                <label for="titulo" class="font-semibold w-1/4">título</label>
                <InputText id="titulo" class="w-full" v-model="eventoEditando.titulo" required minlength="3" autofocus />
            </div>
            
            <div class="flex gap-2 mb-10 flex-col md:flex-row">
                <label for="desc" class="font-semibold w-1/4">desc</label>
                <Textarea id="desc" class="w-full leading-normal" v-model="eventoEditando.descripcion" rows="5" cols="30" />
            </div>

            <div class="text-right flex justify-end gap-x-2">
                <!-- Btn Eliminar -->
                <!-- <Button type="submit" class="mr-auto" severity="danger" icon="pi pi-trash" :disabled="loadingEdit" @click="PromptEliminarEvento"/> -->
                <!-- Btn Cancelar -->
                <Button type="submit" class="" label="Cancelar" severity="secondary" :disabled="loadingEdit" @click="mostrarVentanaEdit=false"/>
                <!-- Btn Guardar -->
                <Button type="submit" class="" :label="ventanaEditHeader" :loading="loadingEdit" @click="GuardarEvento" />
            </div>
        </Dialog>


    </NuxtLayout>
</template>


<script setup>
const calendar = ref(null)
const route = useRoute()
const slug = route.params?.slug
const salonStore = useSalonStore();
const salon = ref(null)
salon.value = salonStore.salones.find(salon => salon.slug === slug)
let periodo = salon.value.archivo.periodos[0]

const evtRefs = ref({})
const router = useRouter()
if (!salon.value.eventos.activar) {
    // Redirect
    router.push(`/salones/${slug}`)
}

const { isHeaderVisible } = useScrollDirection(75)
const auth = useAuth()
import { useAsyncData } from "#app";
import qs from 'qs';
import { createWebHistory } from "vue-router";
const { $formatDateCorto } = useNuxtApp()
const toast = useToast();
const confirm = useConfirm();

import { useScreens } from 'vue-screen-utils';
const { mapCurrent } = useScreens({
    xs: '0px',
    sm: '640px',
    md: '768px',
});
const rows = mapCurrent({ md: 2 }, 1);
const expanded = mapCurrent({ md: false }, true);
const calendarView = ref('monthly')
const masks = {
    "dayPopover": "WWWW D MMMM",
}
const puedeEditar = auth.data.value?.user?.rol == 'docente' || auth.data.value?.user?.isAdmin;
let hoy = new Date();
hoy.setHours(1, 0, 0, 0);

const cacheKey = `eventos-${salon.id}`

const queryParams = qs.stringify({
    depth: 0,
    sort: 'fecha',
    limit: 0,
    where: {
        and: [
            { sala: { equals: salon.id } },
            { fecha: { greater_than_equal: periodo.startDate.toISOString() } },
            { fecha: { less_than_equal: periodo.endDate.toISOString() } }
        ]
    },
}, { encode: false })
const { data: eventos } = await useAsyncData(cacheKey, () => useAPI(`/api/eventos?${queryParams}`))
eventos.value.docs.forEach(evento => {
    evento.fecha = new Date(evento.fecha)
    evento.pasado = evento.fecha < hoy
})

// Dejo comentado codigo para calendario inicie en el primer evento futuro
// const primerEventoFuturo = eventos.value.docs.find(evento => evento.fecha >= hoy)
// const initialPage = { day: primerEventoFuturo.fecha.getDay(), month: primerEventoFuturo.fecha.getMonth()+1, year: primerEventoFuturo.fecha.getFullYear() }

// Pero en realidd prefiero que inicie en el mes 
const initialPage = { day:hoy.getDay(), month: hoy.getMonth()+1, year: hoy.getFullYear() }


const attributes = ref([
    ...eventos.value.docs.map(evento => {
        return {
            highlight: {
                color: 'gray',
            },
            dates: evento.fecha,
            customData: {
                id: evento.id
            },
            // popover: {
            //     label: evento.titulo,
            //     hideIndicator: true,
            // },
        }
    }),
    {
        // Puntito en el dia de hoy
        dot: true,
        dates: hoy
    }
]);

const displayMinDate = ref()
const displayMaxDate = ref()
const eventoIdHovered = ref()

const onUpdatePages = (pages) => {
    //   console.log('pages', pages)
    displayMinDate.value = pages[0].days.filter(d => d.inMonth)[0].date
    const lastPage = pages[pages.length - 1]
    const lastPageDays = lastPage.days.filter(d => d.inMonth)
    displayMaxDate.value = lastPageDays[lastPageDays.length - 1].date
}
const onDayClicked = (date) => {
    if(!puedeEditar){
        // Usuario sin privilegios scrollea 
        // scroll to evento
        const eventoRef = evtRefs.value[eventoIdHovered.value]
        if (eventoRef) {
            eventoRef.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }else{
        // Usuario con privilegios crea nuevo evento
        ComenzarCrearEvento(date)
    }
}
const onDayMouseEnter = (date) => {
    //   console.log('daymousentered', date)
    //   dateHovered.value = date
    if (date.attributes[0]?.customData?.id) {
        eventoIdHovered.value = date.attributes[0].customData.id
    }

}
const onDayMouseLeft = (date) => {
    //   console.log('daymouseleft', date)
    eventoIdHovered.value = null
}
const onDidMove = (date) => {
    //   console.log('didmove', date)
}

const focusEvento = async (evento) => {
    if (eventoIdHovered.value == evento.id) return
    // console.log('focusEvento', evento)
    eventoIdHovered.value = evento.id
    await calendar.value.focusDate(evento.fecha)
}

let calendarDom = null
onMounted(() => {
      window.addEventListener('scroll', handleScroll)
    })
  
onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})
const handleScroll = () => {
    if(!calendarDom){
        calendarDom = document.getElementById('calendar')
    }
    if(calendarDom.getBoundingClientRect().top < 64 ){
        calendarView.value = 'weekly'
    }else{
        calendarView.value = 'monthly'
    }
}

const fechasVisibles = computed(() => {
    return eventos.value.docs.filter(evento => {
        return !evento.pasado || evento.fecha >= displayMinDate.value
    })
})

const isEditing = ref(false)
const mostrarVentanaEdit = ref(false)
const ventanaEditHeader = computed(() => isEditing.value ? 'Editar evento' : 'Crear evento')
const eventoEditando = ref(null)
const loadingEdit = ref(false)

const ComenzarCrearEvento = (evt) => {
    isEditing.value = false
    let fecha = evt.date
    // fecha.setHours(10, 0, 0, 0)
    eventoEditando.value = {
        titulo: '',
        descripcion: '',
        fecha,
    }
    mostrarVentanaEdit.value = true
}

const ComenzarEditarEvento = (evento) => {
    isEditing.value = true
    eventoEditando.value = { ...evento }
    mostrarVentanaEdit.value = true
}

const GuardarEvento = () => {
    if (isEditing.value) {
        GuardarCambiosEvento()
    } else {
        CrearEventoNuevo()
    }
}
const CrearEventoNuevo = async() => {
    loadingEdit.value = true
    try{
        const response = await useAPI('/api/eventos', { method: 'POST', body: eventoEditando.value })
        let evento = response.doc;
        console.log('Evento creado', evento)
        evento.fecha = new Date(evento.fecha)
        // Agrego a la lista de eventos y la reordeno
        eventos.value.docs.push(evento)
        eventos.value.docs.sort((a, b) => a.fecha - b.fecha)
        // Agregado al calendario
        attributes.value.push({
            highlight: {
                color: 'gray',
            },
            dates: evento.fecha,
            customData: {
                id: evento.id
            },
        })
        toast.add({ severity: 'contrast', detail: 'Evento creado', life: 3000 });
        mostrarVentanaEdit.value = false
    }catch(e){
        console.warn(e)
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el evento', life: 3000 });
    }finally{
        loadingEdit.value = false
    }
}

const GuardarCambiosEvento = async() => {
    loadingEdit.value = true
    try{
        const response = await useAPI(`/api/eventos/${eventoEditando.value.id}`, { method: 'PUT', body: eventoEditando.value })
        console.log('Evento editado', response)
        let evento = response.doc;
        evento.fecha = new Date(evento.fecha)
        const idxAttr = attributes.value.findIndex(attr => attr.customData?.id == eventoEditando.value.id)
        attributes.value[idxAttr].dates = evento.fecha
        // Actualizo en la lista de eventos
        const idx = eventos.value.docs.findIndex(evt => evt.id == eventoEditando.value.id)
        eventos.value.docs[idx] = evento
        toast.add({ severity: 'contrast', detail: 'Evento editado', life: 3000 });
    }catch(e){
        console.warn(e)
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo editar el evento', life: 3000 });
    }finally{
        mostrarVentanaEdit.value = false
        loadingEdit.value = false
    }
}

const PromptEliminarEvento = (evento) => {
    confirm.require({
        message: `Estás seguro de borrar ${evento.titulo} del ${$formatDateCorto(evento.fecha)}?`,
        header: 'Borrar evento',
        rejectProps: {
            label: 'Cancelar',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Borrar',
            severity: 'danger',
        },
        reject: () => {
            console.log('Borrar evento cancelada');
        },
        accept: async () => EliminarEvento(evento)
    });
}

const EliminarEvento = async(evento) => {
    loadingEdit.value = true
    try{
        evento.loading = true
        const response = await useAPI(`/api/eventos/${evento.id}`, { method: 'DELETE' })
        console.log('Evento eliminado', response)
        // Elimino del calendario
        const idx = eventos.value.docs.findIndex(evt => evt.id == evento.id)
        eventos.value.docs.splice(idx, 1)
        const idxAttr = attributes.value.findIndex(attr => attr.customData?.id == evento.id)
        attributes.value.splice(idxAttr, 1)
        toast.add({ severity: 'contrast', detail: 'Evento eliminado', life: 3000 });
        mostrarVentanaEdit.value = false
    }catch(e){
        console.warn(e)
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el evento', life: 3000 });
    }finally{
        loadingEdit.value = false
    }
}

</script>

<style>
.vc-container {
    position: sticky !important;
    top: 0px;
    /* padding-top: 50px; */
    @media (min-width: 768px) {
        padding-top: 0px;
        top: 100px;
    }
}
.event-actions{
    button{
        @apply pt-0;
    }
    span{
        @apply text-xs ;
    }
}
</style>