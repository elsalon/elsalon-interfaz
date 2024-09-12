<template>
    <Button label="Nuevo grupo" @click="visible=true"/>


    <div>
        <div v-for="grupo in grupos">
            <h2 class="font-bold">{{ grupo.nombre }}</h2>
            <div v-for="usuario in grupo.integrantes">
                <div class="flex items-center gap-2">
                    <AvatarSalon :usuario="usuario" />
                    <span >{{ usuario.nombre }}</span>
                </div>
            </div>
        </div>
    </div>


    <!-- DIALOG CREAR NUEVO GRUPO -->
    <Dialog v-model:visible="visible" modal header="Nuevo grupo" style="min-width: 35vw;">
         <form @submit.prevent="handleSubmitNuevoGrupo">
        
            <div class="flex gap-2 mb-4 flex-col">
                <label for="username" class="font-semibold">Nombre del grupo</label>
                <InputText id="username" class="w-full" v-model="nuevoGrupo.nombre" required minlength="5" />
            </div>
            <div class="flex gap-2 mb-4 flex-col">
                <label for="username" class="font-semibold">Integrantes</label>
                
                <AutoComplete v-model="nuevoGrupo.usuarios" inputId="multiple-ac-1" multiple fluid :suggestions="sugerenciasUsuarios" @complete="busquedaUsuarios" placeholder="Escribí sus nombres para buscar">
                    <!-- Lista de usuarios elegidos -->
                    <template #chip="slotProps">
                        <div class="flex items-center">
                            <template v-if="slotProps.value.avatar">
                                <Chip :label="slotProps.value.nombre " :image="runtimeConfig.apiBase + slotProps.value.avatar.sizes.thumbnail.url" removable @remove="itemRemoved(slotProps)"/>
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
                                <img :alt="slotProps.option.name" :src="runtimeConfig.apiBase + slotProps.option.avatar.sizes.thumbnail.url" class="w-6 h-6" />
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
                <Button type="button" :loading="postingNewGroup" label="Cancelar" severity="secondary" @click="visible = false"></Button>
                <Button type="submit" :loading="postingNewGroup" label="Crear"></Button>
            </div>
        </form>
    </Dialog>
</template>

<script setup>
    const toast = useToast();
    import { useToast } from "primevue/usetoast";
    const visible = ref(false);
    const sugerenciasUsuarios = ref([]);
    const {data: authData} = useAuth()
    const runtimeConfig = useRuntimeConfig().public;
    const nuevoGrupo = ref({
        nombre: '',
        usuarios: []
    });

    const grupos = ref([]);

    const fetchGrupos = async () => {
        const {docs} = await useApi(`/api/grupos?where[integrantes][contains]=${authData.value.user.id}&limit=10`);
        grupos.value = docs;
    }
    fetchGrupos();

    // LOGICA CREAR NUEVO GRUPO
    const postingNewGroup = ref(false);
    
    const busquedaUsuarios = async (event) => {
        if(event.query.length < 3){
            // minimo 3 caracteres
            return;
        }
        console.log("Buscando", event.query);
        const {docs} = await useApi(`/api/users?where[nombre][contains]=${event.query}&limit=10`); // contains o like ? -> doc: https://payloadcms.com/docs/queries/overview#operators
        sugerenciasUsuarios.value = docs;
    }

    // Función para eliminar un ítem seleccionado
    const itemRemoved = (item) => {
        nuevoGrupo.value.usuarios = nuevoGrupo.value.usuarios.filter((usuario) => usuario.id != item.value.id);
    };

    const handleSubmitNuevoGrupo = async () => {
        if(nuevoGrupo.value.usuarios.length < 1){
            toast.add({severity: 'error', summary: 'Error', detail: 'Tenés que seleccionar al menos un integrante', life: 3000});
            return;
        }
        let data = {
            nombre: nuevoGrupo.value.nombre,
            integrantes: nuevoGrupo.value.usuarios.map((usuario) => usuario.id)
        }
        // Chequeo que el usuario actual esté en el grupo
        if(!nuevoGrupo.value.usuarios.find((usuario) => usuario.id == authData.value.user.id)){
            data.integrantes.push(authData.value.user.id);
        }
        console.log('Creando grupo', nuevoGrupo.value);
        // Crear grupo
        try{
            postingNewGroup.value = true;
            const res = await useApi('/api/grupos', data, 'POST');
            console.log(res);
            toast.add({severity: 'contrast', summary: 'Grupo creado', detail: 'El grupo se creó correctamente', life: 3000});
        }catch(e){
            console.error(e);
            toast.add({severity: 'error', summary: 'Error', detail: 'No se pudo crear el grupo', life: 3000});
        }finally{
            postingNewGroup.value = false;
            visible.value = false;
            fetchGrupos();
        }
    }
</script>