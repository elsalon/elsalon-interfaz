<template>
    <Button label="Nuevo grupo" @click="visible=true"/>

    <!-- DIALOG CREAR NUEVO GRUPO -->
    <Dialog v-model:visible="visible" modal header="Nuevo grupo" style="min-width: 35vw;">
         <form @submit.prevent="handleSubmit">
        
            <div class="flex gap-2 mb-4 flex-col">
                <label for="username" class="font-semibold">Nombre del grupo</label>
                <InputText id="username" class="w-full" v-model="nuevoGrupo.nombre" required minlength="3" />
            </div>
            <div class="flex gap-2 mb-4 flex-col">
                <label for="username" class="font-semibold">Integrantes</label>
                
                <AutoComplete v-model="nuevoGrupo.usuarios" inputId="multiple-ac-1" multiple fluid :suggestions="sugerenciasUsuarios" @complete="busquedaUsuarios">
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
                <Button type="button" label="Cancelar" severity="secondary" @click="visible = false"></Button>
                <Button type="button" label="Crear" @click="visible = false"></Button>
            </div>
        </form>
    </Dialog>
    <!-- <pre>{{ nuevoGrupo }}</pre> -->
    {{ nuevoGrupo.usuarios.map((usuario) => usuario.nombre)}}
</template>

<script setup>
    const visible = ref(false);
    const sugerenciasUsuarios = ref([]);
    const runtimeConfig = useRuntimeConfig().public;
    const nuevoGrupo = ref({
        nombre: '',
        usuarios: []
    });
    
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
</script>