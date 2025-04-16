
<script setup>
const entradaRenderComponent = computed(() => {
  if (typeof props.theme === 'string') {
    return {
      default: resolveComponent('EntradaDefault'),
      biblioteca: resolveComponent('EntradaBiblioteca')
    }[props.theme];
  }
  return props.theme;
});

import { useConfirm } from "primevue/useconfirm";
import { useToast } from 'primevue/usetoast';
const confirm = useConfirm();

const { hooks } = useNuxtApp();
const toast = useToast();
const auth = useAuth()
const props = defineProps({
    theme: {
        type: String,
        default: "default"
    },
    entrada: {
        type: Object,
        required: true,
    },
});
const entradaDom = ref();
const resaltar = ref(false)
const loading = ref(false);
const { entrada } = props;
const emit = defineEmits(['eliminar']);


const identidad = computed(() => {
    return entrada.autoriaGrupal ? entrada.grupo : entrada.autor;
})
const tooltipIdentidad = computed(() => {
    return entrada.autoriaGrupal ? entrada.grupo.integrantes.map(x => x.nombre).join(", ") : '';
})
const identidadUrl = computed(() => {
    return entrada.autoriaGrupal ? `/grupos/${identidad.value.slug}` : `/usuarios/${identidad.value.slug}`;
})

const UsuarioTieneAutoridad = entrada.autoriaGrupal
    ? entrada.grupo?.integrantes.some(i => i.id == auth.data.value.user.id)
    : entrada.autor.id == auth.data.value.user.id;

const usuarioEsAdminODocente = auth.data.value.user.isAdmin || auth.data.value.user.rol == "docente";

const CopiarLink = () => {
    const url = `${window.location.origin}/entradas/${entrada.id}`;
    navigator.clipboard.writeText(url);
    toast.add({ severity: 'contrast', detail: 'Link copiado', life: 3000 });
}

const DestacarEntrada = async () => {
    loading.value = true;
    try{
        const res = await useAPI(`/api/entradas/${props.entrada.id}/destacar`, { method: "PATCH" });
        const destacada = res.destacada;
        const message = destacada ? 'Entrada destacada' : 'Destacado eliminado';
        entrada.destacada = destacada;
        toast.add({ severity: 'contrast', detail: message, life: 3000 });
    }catch(e){
        console.warn(e);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Hubo un error destacando la entrada', life: 3000 });
    }finally{
        loading.value = false;
    }
}

const FijarEntrada = async () => {
        loading.value = true;
        if (props.entrada.fijada) {
            // TODO Dialog de confirmacion
            await useAPI(`/api/fijadas/${props.entrada.fijada}`, { method: 'DELETE' });
            toast.add({ summary: 'Entrada desfijada', severity: 'contrast', life: 3000 });
            useNuxtApp().callHook("entrada:desfijada", { entrada:props.entrada });
        } else {
            useNuxtApp().callHook("entrada:fijar", { entrada:props.entrada }); // Este hook llama al componente FijarEntrada
        }
        loading.value = false;
    }

const EliminarEntrada = async () => {
    try {
        confirm.require({
            message: 'Estás seguro de borrar esta entrada?',
            header: 'Borrar entrada',
            rejectProps: {
                label: 'Cancelar',
                severity: 'secondary',
                outlined: true
            },
            acceptProps: {
                label: 'Borrar',
                severity: 'danger'
            },
            reject: () => {
                console.log('Borrar entrada cancelada');
            },
            accept: async () => {
                loading.value = true;
                const response = await useAPI(`/api/entradas/${entrada.id}`, { method: 'DELETE' });
                console.log("Entrada eliminada:", response)
                emit('eliminar');
                toast.add({ severity: 'contrast', detail: 'Entrada borrada', life: 3000 });
            },
        });
    } catch (e) {
        console.warn(e);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la entrada', life: 3000 });
        loading.value = false;
    }
}

const ResaltarEntrada = () => {
    resaltar.value = true;
    console.log("Resaltando entrada");
    const rect = entradaDom.value.$el.getBoundingClientRect();
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
        entradaDom.value.$el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => {
        resaltar.value = false;
    }, 1200);
}

defineExpose({ ResaltarEntrada });

</script>

<template>
    <component
        ref="entradaDom"
        v-if="identidad?.nombre"
        :is="entradaRenderComponent"
        :key="entrada.id"

        :loading="loading"
        :entrada="entrada"
        :identidadUrl="identidadUrl"
        :identidad="identidad"
        :tooltipIdentidad="tooltipIdentidad"
        :UsuarioTieneAutoridad="UsuarioTieneAutoridad"
        :usuarioEsAdminODocente="usuarioEsAdminODocente"
        :EliminarEntrada="EliminarEntrada"
        :FijarEntrada="FijarEntrada"
        :CopiarLink="CopiarLink"
        :DestacarEntrada="DestacarEntrada"
        :resaltar="resaltar"
        />
</template>

