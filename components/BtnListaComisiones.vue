<template>
    <Button v-if="!noHayComisiones" text type="button" label="Comisiones" @click="comisionesToggle" aria-haspopup="true" aria-controls="overlay_menu" />
    <Button v-else text type="button" label="Comisiones" disabled />
    <Menu ref="comisionesMenu" id="overlay_menu" :model="comisionesItems" :popup="true" />


    <!-- DIALOG CREAR NUEVA COMISION -->
    <Dialog v-model:visible="crearComisionVisible" modal header="Nuevo comision" style="min-width: 35vw;">
         <form @submit.prevent="handleSubmitNuevoGrupo">
        
            <div class="flex gap-2 mb-4 flex-col">
                <label for="username" class="font-semibold">Nombre del comisión</label>
                <InputText id="username" class="w-full" v-model="nuevaComision.nombre" required minlength="3" />
            </div>
            <div class="flex gap-2 mb-4 flex-col">
                <label for="username" class="font-semibold">Docentes</label>
                
                <AutoComplete v-model="nuevaComision.docentes" inputId="multiple-ac-1" multiple fluid :suggestions="sugerenciasDocentes" @complete="busquedaDocentes" placeholder="Escribí sus nombres para buscar">
                    <!-- Lista de usuarios elegidos -->
                    <template #chip="slotProps">
                        <div class="flex items-center">
                            <template v-if="slotProps.value.avatar">
                                <Chip :label="slotProps.value.nombre " :image="slotProps.value.avatar.sizes.thumbnail.url" removable @remove="itemRemoved(slotProps)"/>
                            </template>
                            <template v-else>
                                <Chip :label="slotProps.value.nombre" removable @remove="itemRemoved(slotProps)"/>
                            </template>
                        </div>
                    </template>
                    <!-- List de usuarios en la busqueda -->
                    <template #option="slotProps">
                        <div class="flex items-center">
                            <template v-if="slotProps.option.avatar">
                                <img :alt="slotProps.option.name" :src="slotProps.option.avatar.sizes.thumbnail.url" class="w-6 h-6" />
                            </template>
                            <template v-else>
                                <div class="w-6 h-6"></div>
                            </template>
                            <div class="flex-grow ml-2">{{ slotProps.option.nombre }}</div>
                        </div>
                    </template>
                </AutoComplete>
            </div>

            <div class="flex justify-end gap-2">
                <Button type="button" :loading="creandoNuevaComision" label="Cancelar" severity="secondary" @click="crearComisionVisible = false"></Button>
                <Button type="submit" :loading="creandoNuevaComision" label="Crear"></Button>
            </div>
        </form>
    </Dialog>
</template>

<script setup>
const {data:authData} = useAuth();
const props = defineProps({
    salon: Object,
    required: true
});

const router = useRouter();
const toast = useToast();
const comisionesMenu = ref();
const noHayComisiones = ref(false);

const comisionesToggle = (event) => {
    comisionesMenu.value.toggle(event);
};

const crearComisionVisible = ref(false);
const comisiones = await useAPI(`/api/comisiones?where[or][0][and][0][contexto][equals]=${props.salon.id}`, null, 'GET');
// TODO filtrar solo las comisiones creadas en este periodo actual. De esta forma tambien podemos acceder a comisiones de distintos periodos
// Tambien implica (y esta bien) que en cada periodo nuevo hay que re generar las comisiones
const comisionesItems = ref(comisiones.docs.map(comision => {
    return {
        label: comision.nombre,
        command: () => {
            router.push(`/salones/${props.salon.slug}/comision-${comision.slug}`);
        }
    }
}));

if(authData.value.user.rol == 'docente' || authData.value.user.isAdmin){
    comisionesItems.value.push({
        label: 'Nueva comisión',
        command: () => {
            crearComisionVisible.value = true;
        }
    });
}else if(comisiones.docs.length == 0){
    noHayComisiones.value = true;
}



const nuevaComision = ref({
    nombre: '',
    docentes: []
});
const sugerenciasDocentes = ref([]);

// LOGICA CREAR NUEVA COMISION
const creandoNuevaComision = ref(false);

const busquedaDocentes = async (event) => {
        if(event.query.length < 3){
            // minimo 3 caracteres
            return;
        }
        console.log("Buscando", event.query);
        const {docs} = await useAPI(`/api/users?where[nombre][contains]=${event.query}&where[rol][equals]=docente&limit=10`); // contains o like ? -> doc: https://payloadcms.com/docs/queries/overview#operators
        sugerenciasDocentes.value = docs;
    }

    // Función para eliminar un ítem seleccionado
    const itemRemoved = (item) => {
        nuevaComision.value.docentes = nuevaComision.value.docentes.filter((usuario) => usuario.id != item.value.id);
    };

    const handleSubmitNuevoGrupo = async () => {
        if(nuevaComision.value.docentes.length < 1){
            toast.add({severity: 'error', summary: 'Error', detail: 'Tenés que seleccionar al menos un integrante', life: 3000});
            return;
        }
        const body = {
            nombre: nuevaComision.value.nombre,
            docentes: nuevaComision.value.docentes.map((usuario) => usuario.id),
            contexto: props.salon.id,
        }
        const method = 'POST';
        console.log('Creando comision', nuevaComision.value);
        // Crear comision
        try{
            creandoNuevaComision.value = true;
            const res = await useAPI('/api/comisiones', {body, method});
            console.log(res);
            toast.add({severity: 'contrast', summary: 'Comisión creada', detail: 'La comisión se creó correctamente', life: 3000});
            router.push(`/salones/${props.salon.slug}/comision-${res.doc.slug}`);
        }catch(e){
            console.error(e);
            toast.add({severity: 'error', summary: 'Error', detail: 'No se pudo crear la comisión', life: 3000});
        }finally{
            creandoNuevaComision.value = false;
            crearComisionVisible.value = false;
        }
    }

</script>