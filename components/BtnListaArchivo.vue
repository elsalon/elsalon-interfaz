<template>
    <Button text type="button" label="Archivo" @click="archivoToggle" aria-haspopup="true" aria-controls="overlay_menu" />
    <Menu ref="archivoMenu" id="overlay_menu" :model="archivoItems" :popup="true" />
</template>

<script setup>
const props = defineProps({
    salon: Object,
    required: true
});

const router = useRouter();
const archivoMenu = ref();
const [first, ...periodosDisponibles] = props.salon.archivo.periodos;
// const periodo = props.salon.archivo.periodos[0]
const archivoItems = ref(periodosDisponibles.map(periodo => {
    return {
        label: periodo.nombre,
        command: () => {
            router.push(`/salones/${props.salon.slug}/archivo-${periodo.slug}`);
        }
    }
}));

const archivoToggle = (event) => {
    archivoMenu.value.toggle(event);
};
</script>