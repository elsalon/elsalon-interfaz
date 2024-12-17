<template>

<!-- {{ configuracion }} -->
<form @submit.prevent="handleSubmit" class="space-y-3">
    
    <div class="flex gap-2 mb-4 mt-0 flex-col md:flex-row">
        <label for="notificacionesMailActivas" class="font-semibold w-96">Notificaciones por Mail</label>
        <Checkbox inputId="notificacionesMailActivas" class="w-full" v-model="configuracion.notificacionesMail.activas" binary />
    </div>

    <div class="flex gap-2 mb-4 mt-0 flex-col md:flex-row">
        <label for="mencionNueva" class="w-96">Mencion Nueva</label>
        <Checkbox inputId="mencionNueva" class="w-full" v-model="configuracion.notificacionesMail.mencionNueva" binary :disabled="!configuracion.notificacionesMail.activas"/>
    </div>

    <div class="flex gap-2 mb-4 mt-0 flex-col md:flex-row">
        <label for="comentarioNuevo" class="w-96">Comentario Nuevo</label>
        <Checkbox inputId="comentarioNuevo" class="w-full" v-model="configuracion.notificacionesMail.comentarioNuevo" binary :disabled="!configuracion.notificacionesMail.activas"/>
    </div>

    <div class="text-right mb-10">
        <Button type="submit" class="" label="Guardar" :loading="loading" />
    </div>
</form>
</template>

<script setup>
const salonStore = useSalonStore();
salonStore.SetPageTitle(`Configuración`)

const toast = useToast();
import { useToast } from "primevue/usetoast";
const {data, getSession } = useAuth()
const loading = ref(false)

const configuracion = ref({
    notificacionesMail: {
        activas: data.value.user.notificacionesMail.activas,
        mencionNueva: data.value.user.notificacionesMail.mencionNueva,
        comentarioNuevo: data.value.user.notificacionesMail.comentarioNuevo,
    },
})

const handleSubmit = async () => {
    try{
        loading.value = true

        if(!configuracion.value.notificacionesMail.activas){
            configuracion.value.notificacionesMail.mencionNueva = false
            configuracion.value.notificacionesMail.comentarioNuevo = false
        }

        const userRes = await useAPI(`/api/users/${data.value.user.id}`, {body: configuracion.value, method: 'PATCH'});
        console.log(userRes)
        
        await getSession() // esto funciona pero por algun motivo no es reactivo
    
        toast.add({ severity: 'contrast', detail: 'Configuración guardada', life: 3000});   
    }catch(e){
        console.log(e)
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar tu configuración', life: 3000});
    }
    
    loading.value = false
}
</script>