<template>
    <template v-for="seccion in secciones" :key="seccion.id">
        <template v-if="seccion.relationTo=='linksExternos'">
            <div class="group">
                <Button as="a" target="_blank" :href="seccion.value.url" :label="seccion.value.label" severity="contrast" size="small" class="group-hover:bg-gray-200" text />
                <button v-if="userPuedeEditar" class="opacity-20 group-hover:opacity-100 p-1" @click="openEditModal(seccion)"><i class="pi pi-cog"/></button>
            </div>
        </template>
    </template>
        
    <BtnOpcionesModalLinkExterno 
        v-if="modalVisible"
        :id="currentLinkId" 
        :salon="props.salon"
        :visible="modalVisible" 
        :url="selectedLink.value.url"
        :label="selectedLink.value.label"
        :orden="selectedLink.value.orden"
        @update:visible="modalVisible = $event"
    />
</template>

<script setup>
const user = useAuth().data.value.user;
const userPuedeEditar = user.rol === 'docente' || user.isAdmin

const secciones = computed(() => props.salon.secciones?.sort((a, b) => a.value.orden - b.value.orden));

const props = defineProps({
    salon: {
        type: Object,
        required: true
    }
});

const selectedLink = ref(null);
const modalVisible = ref(false);
const currentLinkId = ref('');
// const currentUrl = ref('');
// const currentLabel = ref('');

function openEditModal(seccion) {
    // Reset the modal data first
    currentLinkId.value = seccion.value.id;
    // currentUrl.value = seccion.value.url;
    // currentLabel.value = seccion.value.label;
    selectedLink.value = seccion;
    modalVisible.value = true;
}

// Reset values when modal closes
watch(modalVisible, (newVal) => {
    if (!newVal) {
        // Reset only when modal is closed
        selectedLink.value = null;
    }
});
</script>