<template>
    <Button v-if="!noHayComisiones" text type="button" label="Comisiones" @click="comisionesToggle" aria-haspopup="true" aria-controls="overlay_menu" />
    <Button v-else text type="button" label="Comisiones" disabled />
    <Menu ref="comisionesMenu" id="overlay_menu" :model="comisionesItems" :popup="true" />
</template>

<script setup>
const {data:authData} = useAuth();
const props = defineProps({
    salon: Object,
    required: true
});

const router = useRouter();
const comisionesMenu = ref();
const noHayComisiones = ref(false);



const comisionesToggle = (event) => {
    comisionesMenu.value.toggle(event);
};

const comisiones = await useApi(`/api/comisiones?where=[contexto][equals]=${props.salon.id}`, null, 'GET');
const comisionesItems = ref(comisiones.docs.map(comision => {
    return {
        label: comision.nombre,
        command: () => {
            router.push(`/salones/${props.salon.slug}/comisiones/${comision.slug}`);
        }
    }
}));
// console.log("comisiones", comisiones)
if(authData.value.user.rol == 'docente' || authData.value.user.isAdmin){
    comisionesItems.value.push({
        label: 'Nueva comisión',
        command: () => {
            router.push(`/salones/${props.salon.slug}/comisiones/nueva`);
        }
    });
}else if(comisiones.docs.length == 0){
    noHayComisiones.value = true;
}

</script>