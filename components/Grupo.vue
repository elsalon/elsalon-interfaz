<template>
    
    <div class="transition-shadow duration-300 overflow-hidden">
<!-- Group Header -->
<div class="flex items-center gap-x-4 py-4 ">
        <AvatarSalon :usuario="grupo" class="w-12 h-12" />
        <h2 class="text-lg font-semibold text-gray-800 grow">{{ grupo.nombre }}</h2>
        <div>
            <Button text @click="ToggleGrupoOptions">...</Button>
            <!-- <Menu :ref="el => menuRefs[grupo.id] = el" id="overlay_menu_grupo" :model="opcionesGrupo" :popup="true" class="text-xs" />  -->
            <Menu :ref="el => menuRefs[grupo.id] = el" id="overlay_menu_article" :model="opcionesGrupo" :popup="true" class="text-xs" /> 
        </div>
      </div>

      <!-- Group Members -->
      <div class="py-4">
        <h3 class="text-sm font-medium text-gray-500 mb-3">Integrantes</h3>
        <div class="flex flex-wrap gap-4">
          <div v-for="usuario in grupo.integrantes" :key="usuario.id" class="flex items-center gap-x-2">
            <AvatarSalon :usuario="usuario" class="w-8 h-8" />
            <span class="text-sm text-gray-700">{{ usuario.nombre }}</span>
          </div>
        </div>
      </div>

      <!-- Options (if needed) -->
      <!-- <div class="px-4 py-3  text-right flex flex-col md:flex-row">
        <Button text class="text-sm text-gray-500 hover:text-gray-700">Agregar integrantes</Button>
        <Button text class="text-sm text-gray-500 hover:text-gray-700">Editar</Button>
        <Button class="text-sm bg-gray-600 border-none">Dejar grupo</Button>
      </div> -->
    </div>
    <Divider/>
</template>

<script setup>
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

const confirm = useConfirm();
const toast = useToast();

const props = defineProps({
    grupo: {
        type: Object,
        required: true,
    },

});

const emit = defineEmits(['abandonadoGrupo']);


const opcionesGrupo = ref([
    {
        label: 'Editar grupo',
        command: () => {
            console.log('Copiar Link');
        }
    },
    {
        label: 'Agregar integrante',
        command: () => {
            console.log('Invitar integrantes');
        }
    },
    {
        label: 'Abandonar grupo',
        command: () => {
            // console.log('Dejar grupo');
            AbandonarDialog();
        }
    }
]);

const menuRefs = ref({})
const ToggleGrupoOptions = (event) => {
    const menu = menuRefs.value[props.grupo.id]
    if (menu && menu.toggle) {
        menu.toggle(event)
    }
};


const AbandonarDialog =  () => {
    confirm.require({
        message: '¿Estás seguro querés abandonar el grupo?',
        header: props.grupo.nombre,
        rejectLabel: 'Cancelar',
        rejectProps: {
            label: 'Cancelar',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Abandonar',
            severity: 'danger'
        },
        accept: async () => {
            try{
                await useApi(`/api/grupos/${props.grupo.id}/abandonar`, {}, 'POST');
                toast.add({ severity: 'contrast', summary: 'Grupos', detail: `Abandonaste el grupo ${grupo.nombre}`, life: 3000 });
                emit('abandonadoGrupo', props.grupo.id);
            }catch(e){
                toast.add({ severity: 'error', summary: 'Error', detail: 'Hubo un error al abandonar el grupo', life: 3000 });
            }
        },
        reject: () => {
            // toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
            // solamente cerrar el dialogo
        }
    });
};

</script>