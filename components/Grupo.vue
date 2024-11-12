<template>
    <!-- Lista de grupos de usuario en opciones > grupos -->
    <div class="transition-shadow duration-300 overflow-hidden">
        <!-- Group Header -->
        <div class="flex items-center gap-x-4 py-4 ">
            <AvatarSalon :usuario="grupo" class="w-12 h-12" />
            <NuxtLink :to="`/grupos/${grupo.slug}`" class="text-lg font-semibold text-gray-800 grow hover:underline">{{ grupo.nombre }}</NuxtLink>
            <!-- <h2 class="text-lg font-semibold text-gray-800 grow">{{ grupo.nombre }}</h2> -->
            <div>
                <Button text @click="ToggleGrupoOptions">...</Button>
                <!-- <Menu :ref="el => menuRefs[grupo.id] = el" id="overlay_menu_grupo" :model="opcionesGrupo" :popup="true" class="text-xs" />  -->
                    <Menu :ref="el => menuRefs[grupo.id] = el" id="overlay_menu_article" :model="opcionesGrupo"
                        :popup="true" class="text-xs" />
                </div>
        </div>
        <a v-if="grupo.link" :href="grupo.link" class="link">{{ grupo.link }}</a>
        <p class="text-sm mt-2">{{ grupo.desc }}</p>

        <!-- Group Members -->
        <div class="py-4">
            <h3 class="text-sm font-medium text-gray-500 mb-3">Integrantes</h3>
            <div class="flex flex-wrap gap-4">
                <NuxtLink v-for="usuario in grupo.integrantes" :to="`/usuarios/${usuario.slug}`" :key="usuario.id" class="flex items-center gap-x-2">
                    <AvatarSalon :usuario="usuario" class="w-8 h-8" />
                    <span class="text-sm text-gray-700">{{ usuario.nombre }}</span>
                </NuxtLink>
            </div>
        </div>


        <Dialog v-model:visible="editarGrupoVisible" modal header="Editar grupo" style="min-width: 35vw;">
            <form @submit.prevent="handleSubmitEdit" class="space-y-3">
                <div class="flex gap-2 mb-4 flex-col md:flex-row">
                    <label for="username" class="font-semibold w-1/4">nombre</label>
                    <InputText id="username" class="w-full" v-model="grupoEdit.nombre" required minlength="3" autofocus />
                </div>

                <div class="flex gap-2 mb-4 flex-col md:flex-row">
                    <label for="avatar" class="font-semibold w-1/4">imagen</label>
                    <input type="file" id="avatar" accept="image/png, image/gif, image/jpeg" ref="avatarFileInput" class="w-full caja-input"/>
                </div>

                <div class="flex gap-2 mb-4 mt-0 flex-col md:flex-row">
                    <label for="link" class="font-semibold w-1/4">link</label>
                    <InputText id="link" class="w-full" type="link" v-model="grupoEdit.link"/>
                </div>

                <div class="flex gap-2 mb-10 flex-col md:flex-row">
                    <label for="desc" class="font-semibold w-1/4">desc</label>
                    <Textarea id="desc" class="w-full leading-normal" v-model="grupoEdit.desc" autoResize rows="5" cols="30" />
                </div>
                
                <div class="text-right mb-10">
                    <Button type="submit" class="" label="Guardar" :loading="loading" />
                </div>

            </form>
        </Dialog>
        
    </div>
    <Divider />
</template>

<script setup>
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
const { data: authData } = useAuth()

const confirm = useConfirm();
const toast = useToast();

const props = defineProps({
    grupo: {
        type: Object,
        required: true,
    },
});



const grupoEdit = ref({
    nombre: props.grupo.nombre,
    link: props.grupo.link,
    desc: props.grupo.desc,
    // avatar: props.grupo.avatar,
});

const emit = defineEmits(['abandonadoGrupo', 'editadoGrupo']);
const editarGrupoVisible = ref(false);
const loading = ref(false);

const opcionesGrupo = ref([
    {
        label: 'Editar grupo',
        command: () => {
            editarGrupoVisible.value = true;
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


const AbandonarDialog = () => {
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
            try {
                const body = {
                    integrantes: props.grupo.integrantes.filter((i) => i.id != authData.value.user.id).map((i) => i.id) // envio los ids de los integrantes menos el mio
                }
                await useAPI(`/api/grupos/${props.grupo.id}`, {body, method: "PATCH"});
                toast.add({ severity: 'contrast', summary: 'Grupos', detail: `Abandonaste el grupo "${props.grupo.nombre}"`, life: 3000 });
                emit('abandonadoGrupo', props.grupo.id);
            } catch (e) {
                console.error(e);
                toast.add({ severity: 'error', summary: 'Error', detail: 'Hubo un error al abandonar el grupo', life: 3000 });
            }
        },
        reject: () => {
            // toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
            // solamente cerrar el dialogo
        }
    });
};

const avatarFileInput = ref()

const handleSubmitEdit = async() =>{
    try{
        loading.value = true;

        if (avatarFileInput.value.files.length > 0) {
            const avatarFile = avatarFileInput.value.files[0]
            const formData = new FormData()
            formData.append('file', avatarFile)
            const avatarRes = await useUploadFile('/api/avatares', formData);
            // console.log(avatarRes)
            grupoEdit.value.avatar = avatarRes.doc.id
        }

        // Luego guardamos el perfil
        const res = await useAPI(`/api/grupos/${props.grupo.id}`, {body: grupoEdit.value, method: 'PATCH'});
        console.log(res)

        // clear file input
        avatarFileInput.value.value = ''
        toast.add({ severity: 'contrast', detail: 'Grupo guardado', life: 3000});   
        emit('editadoGrupo', res.doc);
    }catch(e){
        console.error('Error al guardar grupo', e)
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar grupo', life: 3000});
    }finally{
        editarGrupoVisible.value = false
        loading.value = false
    }
}

</script>