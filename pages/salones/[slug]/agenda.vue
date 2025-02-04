<template>
    <NuxtLayout name="layout-contenido">
        <template #header>
            <NuxtLink :to="`/salones/${salon.slug}`" class="link">{{ salon.nombre }}</NuxtLink> / Agenda
        </template>

        <div class="text-center mb-2">
            <LogoSala :salon="salon"/>
            <NuxtLink class="text-3xl font-bold" :to="`/salones/${salon.slug}`"><h1>{{ salon.nombre }}</h1></NuxtLink>
            
            <!-- <BtnListaComisiones :salon="salon" :periodo="periodo"/>
            <BtnListaArchivo v-if="salon.archivo.activar" :salon="salon"/> -->
            <div class="flex flex-col md:flex-row space-x-2">

                <client-only>
               
                <VCalendar 
                    ref="calendar"
                    class="mt-5"
                    borderless
                    :rows="rows"
                    :expanded="expanded"
                    :masks="masks"
                    :attributes="attributes"
                    locale="es"
                    timezone="UTC"
    
    
                    :min-date="periodo.startDate"
                    :max-date="periodo.endDate"

                    :initial-page="initialPage"
                    
    
                    @dayclick="onDayClicked" 
                    @daymouseenter="onDayMouseEnter" 
                    @daymouseleave="onDayMouseLeft"
                    @did-move="onDidMove"
                    @update:pages="onUpdatePages"
                    >
    
                </VCalendar>
                
                <div class="md:mt-14 w-full">
                    <div v-if="!fechasVisibles.length" class="text-center text-gray-500 text-sm">No hay eventos en este periodo</div>
                    <div v-for="evento in fechasVisibles" :key="evento.id" class="p-2 mb-2 text-left hover:cursor-pointer" :class="{'bg-orange-50': eventoIdHovered == evento.id, 'text-gray-400': evento.pasado}" @click="focusEvento(evento)" @mouseleave="eventoIdHovered = null">
                        <div class="text-lg font-semibold">{{ evento.titulo }}</div>
                        <div class="text-sm text-gray-500">{{ $formatDateCorto(evento.fecha) }}</div>
                        <div class="">{{ evento.descripcion }}</div>
                    </div>    
                </div>
                </client-only>
            </div>
            
        </div> 

        
    </NuxtLayout>
</template>


<script setup>
const calendar = ref(null)
const route = useRoute()
const slug = route.params?.slug
const salonStore = useSalonStore();
const salon = ref(null)
salon.value = salonStore.salones.find(salon => salon.slug === slug)
const periodo = salon.value.archivo.periodos[0]

if(!salon.value.agenda.activar){
    // Redirect
    navigateTo(`/salones/${slug}`)
}

import { useAsyncData } from "#app";
import qs from 'qs';
const { $formatDateCorto } = useNuxtApp()

import { useScreens } from 'vue-screen-utils';
const { mapCurrent } = useScreens({
  xs: '0px',
  sm: '640px',
  md: '768px',
});
const rows = mapCurrent({ md: 2 }, 1);
const expanded = mapCurrent({ md: false }, true);

const masks= {
    "dayPopover": "WWWW D MMMM",
}
let hoy = new Date();
hoy.setHours(1, 0, 0, 0);

const cacheKey = `agenda-${salon.id}`

const queryParams = qs.stringify({
  depth: 0,
  sort: 'fecha',
  limit: 0,
  where:{
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

const primerEventoFuturo = eventos.value.docs.find(evento => evento.fecha >= hoy)
const initialPage = {day: primerEventoFuturo.fecha.getDay(), month: primerEventoFuturo.fecha.getMonth(), year: primerEventoFuturo.fecha.getFullYear()}
console.log({initialPage})

const attributes = ref(
    eventos.value.docs.map(evento => {
        return {
            highlight: {
                color: 'gray',
            },
            dates: evento.fecha,
            customData:{
                id:evento.id
            },
            // popover: {
            //     label: evento.titulo,
            //     hideIndicator: true,
            // },
        }
    })
);

const displayMinDate = ref()
const displayMaxDate = ref()
const eventoIdHovered = ref()

const onUpdatePages = (pages) => {
//   console.log('pages', pages)
  displayMinDate.value = pages[0].days.filter(d=>d.inMonth)[0].date
  const lastPage = pages[pages.length - 1]
  const lastPageDays = lastPage.days.filter(d=>d.inMonth)
  displayMaxDate.value = lastPageDays[lastPageDays.length - 1].date
}
const onDayClicked = (date) => {
  console.log('dayclicked', date)
}
const onDayMouseEnter = (date) => {
//   console.log('daymousentered', date)
//   dateHovered.value = date
    if(date.attributes[0]?.customData?.id){
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
    if(eventoIdHovered.value == evento.id) return
    // console.log('focusEvento', evento)
    eventoIdHovered.value = evento.id
    await calendar.value.focusDate(evento.fecha)
}

const fechasVisibles = computed(() => {
    return eventos.value.docs.filter(evento => {
        return !evento.pasado || evento.fecha >= displayMinDate.value
    })
})


</script>