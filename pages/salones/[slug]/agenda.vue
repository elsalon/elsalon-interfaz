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

            <client-only>
           
            <VCalendar 
                class="mt-5"
                :columns="columns" :expanded="expanded"
                :attributes="attributes"
                locale="es" 

                :min-date="periodo.startDate"
                :max-date="periodo.endDate"
                

                @dayclick="onDayClicked" 
                @daymouseenter="onDayMouseEnter" 
                @daymouseleave="onDayMouseLeft"
                @did-move="onDidMove"
                >

            </VCalendar>
            </client-only>
        </div> 
    </NuxtLayout>
</template>


<script setup>
import { useScreens } from 'vue-screen-utils';


const { mapCurrent } = useScreens({
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
});
const columns = mapCurrent({ lg: 2 }, 1);
const expanded = mapCurrent({ lg: false }, true);


const route = useRoute()
const slug = route.params?.slug
const salonStore = useSalonStore();
const salon = ref(null)
salon.value = salonStore.salones.find(salon => salon.slug === slug)
console.log(salon.value.archivo.periodos)
const periodo = salon.value.archivo.periodos[0]
console.log(periodo.startDate)

const attributes = ref([
  {
    highlight: {
      color: 'gray',
    },
    dates: new Date(2022, 10, 2),
    popover: {
      label: "test",
    },
  },
]);

const onDayClicked = (date) => {
  console.log('dayclicked', date)
}
const onDayMouseEnter = (date) => {
  console.log('daymousentered', date)
}
const onDayMouseLeft = (date) => {
  console.log('daymouseleft', date)
}
const onDidMove = (date) => {
  console.log('didmove', date)
}
</script>