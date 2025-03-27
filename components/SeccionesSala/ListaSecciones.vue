<template>
    <template v-for="seccion in secciones" :key="seccion.id">
        <div class="group">
            <!-- Dynamic button based on section type -->
             <Button
                v-if="seccion.componente[0].blockType === 'linkExterno'"
                :label="seccion.nombre"
                :href="seccion.componente[0].url"
                as="a" 
                target="_blank" 
                severity="contrast" 
                size="small" 
                class="group-hover:bg-gray-200" 
                text />
            
            <Button 
                v-else-if="seccion.componente[0].blockType === 'pagina'"
                as="router-link" 
                :to="`/salas/${props.salon.slug}/pagina/${seccion.slug}`" 
                :label="seccion.nombre" 
                severity="contrast" 
                size="small" 
                class="group-hover:bg-gray-200" 
                text 
            />
            
            <button 
                v-if="userPuedeEditar" 
                class="opacity-20 group-hover:opacity-100 p-1" 
                @click="openEditModal(seccion)"
            >
                <i class="pi pi-cog"/>
            </button>
        </div>
    </template>
    
    <!-- Dynamic modal component -->
    <component 
        v-if="modalVisible && selectedItem"
        :is="getModalComponent"
        v-bind="getModalProps"
        :visible="modalVisible"
        :salon="props.salon"
        @update:visible="modalVisible = $event"
    />
</template>

<script setup>
import { defineAsyncComponent } from 'vue';
const user = useAuth().data.value.user;
const userPuedeEditar = user.rol === 'docente' || user.isAdmin;

const props = defineProps({
    salon: {
        type: Object,
        required: true
    }
});

const secciones = computed(() => props.salon.secciones?.sort((a, b) => a.orden - b.orden));

const modalVisible = ref(false);
const selectedItem = ref(null);
const modalType = ref('');

// Modal component mapping with dynamic imports
const MODAL_COMPONENTS = {
    'linkExterno': defineAsyncComponent(() => 
        import('../BtnOpciones/ModalLinkExterno.vue')
    ),
    'pagina': defineAsyncComponent(() => 
        import('../BtnOpciones/ModalPagina.vue')
    ),
};

// Modal prop mapping for each type
const MODAL_PROPS_MAP = {
    'linkExterno': (item) => ({
        id: item.id,
        url: item.componente[0].url,
        label: item.nombre,
        orden: item.orden
    }),
    'pagina': (item) => ({
        id: item.id,
        titulo: item.nombre,
        orden: item.orden
    })
};

// Computed property to get the correct modal component
const getModalComponent = computed(() => {
    return MODAL_COMPONENTS[modalType.value] || null;
});

// Computed property to get the correct props for the modal
const getModalProps = computed(() => {
    if (!selectedItem.value || !modalType.value) return {};
    const propMapper = MODAL_PROPS_MAP[modalType.value];
    return propMapper ? propMapper(selectedItem.value) : {};
});

function openEditModal(seccion) {
    console.log(seccion);
    modalType.value = seccion.componente[0].blockType;
    selectedItem.value = seccion;
    modalVisible.value = true;
}

// Reset values when modal closes
watch(modalVisible, (newVal) => {
    if (!newVal) {
        selectedItem.value = null;
    }
});
</script>