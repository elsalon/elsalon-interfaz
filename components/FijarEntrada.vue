<template>
    <Dialog v-model:visible="visible" modal header="Fijar entrada" :style="{ width: '25rem' }">

        <span class="text-surface-500 dark:text-surface-400 block mb-8">Elegí por cuanto tiempo fijar esta
            entrada</span>

        <div v-for="opcion in opciones" :key="opcion.value" class="flex items-center gap-2">
            <RadioButton v-model="opcionSeleccionada" name="dynamic" :value="opcion.value" :input-id="opcion.value"
                variant="filled" />
            <label :for="opcion.value">{{ opcion.label }}</label>
        </div>

        <div class="flex justify-end gap-2">
            <Button type="button" label="Cancelar" severity="secondary" @click="visible = false" :disabled="loading"></Button>
            <Button type="button" label="Fijar" @click="Fijar" :loading="loading"></Button>
        </div>
    </Dialog>
</template>


<script setup>
const { hooks } = useNuxtApp();
const visible = ref(false);
let removeFijar = null;
const loading = ref(false)
const salonStore = useSalonStore();
const toast = useToast();

const opciones = [
    { label: '24 horas', value: 'dia' },
    { label: '7 dias', value: 'semana' },
    { label: '30 días', value: 'mes' },
    { label: 'Todo este año', value: 'anno' },
];
const opcionSeleccionada = ref(opciones[0].value);
const entrada = ref(null);

const Open = (data) => {
    entrada.value = data.entrada;
    opcionSeleccionada.value = opciones[0].value;
    visible.value = true;
}

const Fijar = async () => {
    loading.value = true;
    console.log("Fijando entrada", entrada.value.id, opcionSeleccionada.value);
    const method = 'POST';
    const body = { contexto: salonStore.contextoId, entrada: entrada.value.id, duracion: opcionSeleccionada.value};
    const res = await useAPI(`/api/fijadas`, {body, method});
    if (res.doc.id) {
        toast.add({summary:'Entrada fijada', severity: 'contrast', life: 3000});
    } else {
        toast.add({summary:'Error al fijar entrada', severity: 'error', life: 3000});
    }
    visible.value = false;
    loading.value = false;
}

onMounted(() => {
    removeFijar = hooks.hook('entrada:fijar', Open)
});


onUnmounted(() => {
    if (removeFijar) removeFijar();
})

</script>