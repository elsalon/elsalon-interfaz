<template>
    <div class="absolute right-0" v-if="opciones.length > 0">
        <Button text @click="ToggleMenu">...</Button>
        <Menu v-if="opciones.length>0" ref="menu" id="overlay_menu_article" :model="opciones"
            :popup="true" class="text-xs" />
    </div>
</template>

<script setup>
const props = defineProps({
    otro: {
        type: Object,
        required: true,
    }
})
const emit = defineEmits(['userEdited'])
const loading = ref(false)
const user = useAuth().data.value.user;
const menu = ref()
const ToggleMenu = (event) => {
    menu.value.toggle(event)
};
const toast = useToast();
const opciones =  ref([]);

const GenerarOpcionesRoles = () => {
    opciones.value = []
    if(user.rol === 'docente'){
        if(props.otro.rol !== 'docente'){
            opciones.value.push({ 
                label: 'Otorgar rol docente', 
                icon: 'pi pi-plus',
                command: () => {
                    CambiarRol('docente')
                },
             })
        }else{
            opciones.value.push({ 
                label: 'Quitar rol docente', 
                icon: 'pi pi-minus',
                command: () => {
                    CambiarRol('alumno')
                },
            })
        }
    }

    if(user.isAdmin){
        if(!props.otro.isAdmin){
            opciones.value.push({ 
                label: 'Otorgar rol admin',
                icon: 'pi pi-plus',
                command: () => {
                    ToggleAdmin()
                },
            })
        }else{
            opciones.value.push({ 
                label: 'Quitar rol admin',
                icon: 'pi pi-minus',
                command: () => {
                    ToggleAdmin()
                },
            })
        }
    }
}

if(user.id !== props.otro.id){
    GenerarOpcionesRoles();
}

const CambiarRol = async(nuevoRol) => {
    if(loading.value) return;
    loading.value = true
    try{
        const res = await useAPI(`/api/users/${props.otro.id}/cambiar-rol`, {body:{rol:nuevoRol}, method: 'PATCH'})
        emit('userEdited', res)
        nextTick(() => {
            GenerarOpcionesRoles();
        })
        toast.add({severity: 'contrast', summary: "Rol cambiado", detail: `${props.otro.nombre} ahora es ${nuevoRol}`, life:3000});
    }catch(e){
        console.warn("Error cambiando rol", e)
    }finally{
        loading.value = false;
    }
}


const ToggleAdmin = async() => {
    if(loading.value) return;
    loading.value = true;
    try{
        const res = await useAPI(`/api/users/${props.otro.id}/toggle-admin`, {method: 'PATCH'})
        nextTick(() => {
            GenerarOpcionesRoles();
        })
        const detail = res.isAdmin ? `${props.otro.nombre} ahora es Admin` : `${props.otro.nombre} ya no es Admin`
        toast.add({severity: 'contrast', summary: "Admin cambiado", detail, life:3000});
    }catch(e){
        console.warn("Error toggle admin", e)
    }finally{
        loading.value = false;
    }
}

</script>