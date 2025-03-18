<template>
    <template v-if="userPuedeEditar">
        <Button label="+ Agregar sección" severity="secondary" size="small" class="border border-zinc-300 rounded"
            @click="toggleMenu" aria-haspopup="true" aria-controls="overlay_menu" />
        <Menu ref="menu" id="overlay_menu" class="text-sm" :model="items" :popup="true" />
    </template>

    <BtnOpcionesModalLinkExterno v-model:visible="mostrarModalLinkExterno" :salon="salon"/>
</template>

<script setup>
const props = defineProps({
    salon: Object,
    required: true
})
const user = useAuth().data.value.user;
const userPuedeEditar = user.rol === 'docente' || user.isAdmin
const menu = ref();

const mostrarModalLinkExterno = ref(false);
const items = ref([
    {
        label: 'Link externo',
        command: () => {
            mostrarModalLinkExterno.value = true
        }
    }

]);

const toggleMenu = (event) => {
    menu.value.toggle(event);
};
</script>