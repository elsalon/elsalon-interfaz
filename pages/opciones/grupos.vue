<template>
    
    <template v-if="salonStore.gruposDelUsuarioFetching">
        <div class="my-4 text-center text-gray-500 text-sm">Cargando...</div>
    </template>
    <template v-else-if="salonStore.gruposDelUsuario.length">
        <Button label="Nuevo grupo" @click="visible=true" class="mb-10"/>
    </template>
    <template v-else>
        <div class="text-center mt-10">
            <p class="my-10 text-gray-500">Podés crear grupos de trabajo con tus compañerxs para postear colectivamente y compartir una bitácora de progeso</p>
            <Button label="Crear primer grupo" @click="visible=true" class="mb-10"/>
        </div>
    </template>
    
    <Grupo v-for="grupo in salonStore.gruposDelUsuario" :key="grupo.id" :grupo="grupo" @abandonadoGrupo="handleAbandonadoGrupo" @editadoGrupo="handleEditadoGrupo"/>

    <!-- DIALOG CREAR NUEVO GRUPO -->
    <Dialog v-model:visible="visible" modal header="Nuevo grupo" style="min-width: 35vw;">
         <form @submit.prevent="handleSubmitNuevoGrupo">
        
            <div class="flex gap-2 mb-4 flex-col">
                <label for="username" class="font-semibold">Nombre del grupo</label>
                <InputText id="username" class="w-full" v-model="nuevoGrupo.nombre" required minlength="5" />
            </div>
            <div class="flex gap-2 mb-4 flex-col">
                <label for="username" class="font-semibold">Integrantes</label>
                
                 <SelectorUsuarios v-model="nuevoGrupo.usuarios" />
            </div>

            <div class="flex justify-end gap-2">
                <Button type="button" :loading="creandoNuevoGrupo" label="Cancelar" severity="secondary" @click="visible = false"></Button>
                <Button type="submit" :loading="creandoNuevoGrupo" label="Crear"></Button>
            </div>
        </form>
    </Dialog>
</template>

<script setup>
    const toast = useToast();
    import { useToast } from "primevue/usetoast";
import salon from "~/primevue-presets/salon";
    const visible = ref(false);
    const {data: authData} = useAuth()
    const nuevoGrupo = ref({
        nombre: '',
        usuarios: []
    });
    const fetching = ref(true)
    const salonStore = useSalonStore();
    salonStore.SetPageTitle(`Grupos`)
    

    const handleAbandonadoGrupo = (grupo) => {
        console.log('Abandonado grupo', grupo);
        salonStore.FetchGruposDelUsuario(true)
    }

    const handleEditadoGrupo = (grupo) => {
        console.log('Grupo editado', grupo);
        salonStore.FetchGruposDelUsuario(true)
    }

    salonStore.FetchGruposDelUsuario();

    // LOGICA CREAR NUEVO GRUPO
    const creandoNuevoGrupo = ref(false);

    const handleSubmitNuevoGrupo = async () => {
        if(nuevoGrupo.value.usuarios.length < 1){
            toast.add({severity: 'error', summary: 'Error', detail: 'Tenés que seleccionar al menos un integrante', life: 3000});
            return;
        }
        let body = {
            nombre: nuevoGrupo.value.nombre,
            integrantes: nuevoGrupo.value.usuarios.map((usuario) => usuario.id)
        }
        // Chequeo que el usuario actual esté en el grupo
        if(!nuevoGrupo.value.usuarios.find((usuario) => usuario.id == authData.value.user.id)){
            body.integrantes.push(authData.value.user.id);
        }
        console.log('Creando grupo', nuevoGrupo.value);
        // Crear grupo
        try{
            creandoNuevoGrupo.value = true;
            const method = 'POST';
            const res = await useAPI('/api/grupos', {body, method});
            console.log(res);
            toast.add({severity: 'contrast', summary: 'Grupo creado', detail: 'El grupo se creó correctamente', life: 3000});
        }catch(e){
            console.error(e);
            toast.add({severity: 'error', summary: 'Error', detail: 'No se pudo crear el grupo', life: 3000});
        }finally{
            creandoNuevoGrupo.value = false;
            visible.value = false;
            salonStore.FetchGruposDelUsuario(true)
        }
    }
</script>
