<template>
    <div class="flex space-x-2 mt-2">
        <!-- Opciones de unirse a comision (individual o grupos) -->
        <Button v-if="unirMenuItems.length" type="button" label="Unirme" severity="secondary" @click="unirMenuToggle" aria-haspopup="true" aria-controls="unirMenu" :loading="loading" />
        <Menu ref="unirMenu" id="unirMenu" :model="unirMenuItems" :popup="true" />
        
        <!-- Opciones de abandonar  comision (individual o grupos) -->
        <Button v-if="abandonarMenuItems.length" type="button" label="Abandonar" severity="secondary" @click="abandonarMenuToggle" aria-haspopup="true" aria-controls="abandonarMenu" :loading="loading" />
        <Menu ref="abandonarMenu" id="abandonarMenu" :model="abandonarMenuItems" :popup="true" />
    </div>
</template>

<script setup>
const {data: authData} = useAuth()
const props = defineProps({
    comision: Object,
    required: true
});
const emit = defineEmits(['UsuarioCambioInscripcion']);
const toast = useToast();
const loading = ref(false);
const unirMenu = ref();
const abandonarMenu = ref();
const unirMenuItems = ref([]);
const abandonarMenuItems = ref([]);

const {docs: gruposUsuario} = await useApi(`/api/grupos?where[integrantes][contains]=${authData.value.user.id}&limit=10`, null, 'GET');

const GenerarOpcionesBotones = () =>{
    // Individualmente
    const usuarioPertence = props.comision.integrantes?.find(alumno => alumno.id == authData.value.user.id) || props.comision.docentes?.find(docente => docente.id == authData.value.user.id) || false;
    // Como grupo
    const gruposUsuarioPertenecen = props.comision.grupos?.filter(grupo => grupo.integrantes.map(usuario => usuario.id).includes(authData.value.user.id)) || [];
    const gruposUsuarioNoPertenecen = gruposUsuario.filter(grupo => !gruposUsuarioPertenecen.map(grupo => grupo.id).includes(grupo.id));
    // Agrego opciones (entrar o salir) para usuario individual
    if(usuarioPertence){
        abandonarMenuItems.value.push({
            label: `como ${authData.value.user.nombre}`,
            command: () => {
                AbandonarComisionIndividuo();
            }
        });
    }else{
        unirMenuItems.value.push({
            label: `como ${authData.value.user.nombre}`,
            command: () => {
                UnirmeComisionIndividuo();
            }
        });
    }
    
    // Agrego opciones de salir para los grupos del usuario que perteneces
    gruposUsuarioPertenecen.forEach(grupo => {
        abandonarMenuItems.value.push({
            label: `como ${grupo.nombre}`,
            command: () => {
                AbandonarComisionGrupo(grupo);
            }
        });
    });
    
    // Agrego opciones de unirme para los grupos del usuario que no pertenece
    gruposUsuarioNoPertenecen.forEach(grupo => {
        unirMenuItems.value.push({
            label: `como ${grupo.nombre}`,
            command: () => {
                UnirmeComisionGrupo(grupo);
            }
        });
    });
}

GenerarOpcionesBotones();

const unirMenuToggle = (event) => {
    unirMenu.value.toggle(event);
};
const abandonarMenuToggle = (event) => {
    abandonarMenu.value.toggle(event);
};


// FUNCIONES API
const UnirmeComisionIndividuo = async () =>{
    try{
        loading.value = true;
        await useApi(`/api/comisiones/${props.comision.id}/unirme`, null, 'PATCH')
        emit('UsuarioCambioInscripcion');
        toast.add({severity: 'contrast', detail: 'Te uniste a la comisión', life:3000});
    }catch(e){
        console.log(e)
    }finally{
        loading.value = false;
    }
}

const AbandonarComisionIndividuo = async () =>{
    try{
        loading.value = true;
        await useApi(`/api/comisiones/${props.comision.id}/abandonar`, null, 'PATCH')
        emit('UsuarioCambioInscripcion');
        toast.add({severity: 'contrast', detail: 'Abandonaste la comisión', life:3000});
    }catch(e){
        console.log(e)
    }finally{
        loading.value = false;
    }
}

const UnirmeComisionGrupo = async (grupo) =>{
    try{
        loading.value = true;
        await useApi(`/api/comisiones/${props.comision.id}/unirme`, {grupoId: grupo.id}, 'PATCH')
        emit('UsuarioCambioInscripcion');
        toast.add({severity: 'contrast', detail: `Te uniste a la comisión como ${grupo.nombre}`, life:3000});
    }catch(e){
        console.log(e)
    }finally{
        loading.value = false;
    }
}

const AbandonarComisionGrupo = async (grupo) =>{
    try{
        loading.value = true;
        await useApi(`/api/comisiones/${props.comision.id}/abandonar`, {grupoId: grupo.id}, 'PATCH')
        emit('UsuarioCambioInscripcion');
        toast.add({severity: 'contrast', detail: `Abandonaste la comisión como ${grupo.nombre}`, life:3000});
    }catch(e){
        console.log(e)
    }finally{
        loading.value = false;
    }
}
</script>