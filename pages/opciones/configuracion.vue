<template>

<!-- {{ configuracion }} -->
    <div class="flex gap-2 flex-row font-mono">
        <Checkbox inputId="notificacionesNavegador" v-model="permisoNotificacionesNavegador" binary :disabled="permisoNotificacionesNavegador" />
        <label for="notificacionesNavegador" class="font-semibold w-96" v-tooltip.bottom="'Al hacer clic, el navegador te pedirá permiso para enviar notificaciones. Se desactivan manualmente en los ajustes del navegador'">Notificaciones Navegador</label>
    </div>

    <div class="h-10"></div>

<form @submit.prevent="handleSubmit" class="space-y-3">
    
    <div class="flex gap-2 flex-row">
        <Checkbox inputId="notificacionesMailActivas" v-model="configuracion.notificacionesMail.activas" binary />
        <label for="notificacionesMailActivas" class="font-semibold w-96">Notificaciones por Mail</label>
    </div>

    <div class="flex gap-2 flex-row">
        <Checkbox inputId="mencionNueva" v-model="configuracion.notificacionesMail.mencionNueva" binary :disabled="!configuracion.notificacionesMail.activas"/>
        <label for="mencionNueva" class="w-96">Mencion Nueva</label>
    </div>

    <div class="flex gap-2 flex-row">
        <Checkbox inputId="comentarioNuevo" v-model="configuracion.notificacionesMail.comentarioNuevo" binary :disabled="!configuracion.notificacionesMail.activas"/>
        <label for="comentarioNuevo" class="w-96">Comentario Nuevo</label>
    </div>

    <div class="h-5"></div>

    <div class="flex gap-2 flex-row">
        <Checkbox inputId="ocultarContadorPalabras" v-model="configuracion.opciones.ocultarContadorPalabras" binary/>
        <label for="ocultarContadorPalabras" class="w-96">Ocultar Contador Palabras</label>
    </div>

    <div class="text-right">
        <Button type="submit" class="" label="Guardar" :loading="loading" />
    </div>
</form>
</template>

<script setup>
const salonStore = useSalonStore();
salonStore.SetPageTitle(`Configuración`)

const toast = useToast();
import { useToast } from "primevue/usetoast";
const auth = useAuth()
const user = auth.data.value.user

const loading = ref(false)

const configuracion = ref({
    notificacionesMail: {
        activas: user?.notificacionesMail.activas,
        mencionNueva: user?.notificacionesMail.mencionNueva,
        comentarioNuevo: user?.notificacionesMail.comentarioNuevo,
    },
    opciones: {
        ocultarContadorPalabras: user?.opciones.ocultarContadorPalabras,
    }
})

const permisoNotificacionesNavegador = ref()
watch(permisoNotificacionesNavegador, (val) => {
    if(val){
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                permisoNotificacionesNavegador.value = true
            }else{
                permisoNotificacionesNavegador.value = false
            }
        });
    }
})

const handleSubmit = async () => {
    try{
        loading.value = true

        if(!configuracion.value.notificacionesMail.activas){
            configuracion.value.notificacionesMail.mencionNueva = false
            configuracion.value.notificacionesMail.comentarioNuevo = false
        }

        const userRes = await useAPI(`/api/users/${user.id}`, {body: configuracion.value, method: 'PATCH'});
        console.log(userRes)
        
        // await getSession() // esto funciona pero por algun motivo no es reactivo
    
        toast.add({ severity: 'contrast', detail: 'Configuración guardada', life: 3000});   
    }catch(e){
        console.log(e)
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar tu configuración', life: 3000});
    }
    
    loading.value = false
}

onMounted(async () => {
    permisoNotificacionesNavegador.value = Notification.permission === 'granted'
})
</script>