<template>
    <form @submit.prevent="handleSubmit" class="space-y-3">
        <div class="flex gap-2 mb-4 flex-col md:flex-row">
            <label for="username" class="font-semibold w-24">nombre</label>
            <InputText id="username" class="w-full" v-model="perfil.nombre" required minlength="3" />
        </div>

        <div class="flex gap-2 mb-4 mt-0 flex-col md:flex-row">
            <label for="email" class="font-semibold w-24">email</label>
            <InputText id="email" class="w-full" type="email" v-model="perfil.email" required/>
        </div>

        <div class="flex gap-2 mb-4 flex-col md:flex-row">
            <label for="avatar" class="font-semibold w-24">avatar</label>
            <input type="file" id="avatar" ref="avatarFileInput" class="w-full caja-input"/>
        </div>

        <div class="flex gap-2 mb-4 flex-col md:flex-row">
            <label for="bio" class="font-semibold w-24">bio</label>
            <Textarea id="bio" class="w-full leading-normal" v-model="perfil.bio" autoResize rows="5" cols="30" />
        </div>
        
        <div class="text-right">
            <Button type="submit" class="" label="Guardar" :loading="loading" />
        </div>

    </form>

</template>

<script setup>
const toast = useToast();
import { useToast } from "primevue/usetoast";
const {data, getSession } = useAuth()
const loading = ref(false)
const perfil = ref({
    nombre: data.value.user.nombre,
    email: data.value.user.email,
    bio: data.value.user.bio,
})
const avatarFileInput = ref()

const handleSubmit = async () => {
    try{
        loading.value = true
        // Primero chequeamos si hay que subir el avatar
        if (avatarFileInput.value.files.length > 0) {
            const avatarFile = avatarFileInput.value.files[0]
            const formData = new FormData()
            formData.append('file', avatarFile)
            const avatarRes = await useUploadFile('/api/avatares', formData);
            // console.log(avatarRes)
            perfil.value.avatar = avatarRes.doc.id
        }

        // Luego guardamos el perfil
        const userRes = await useApi(`/api/users/${data.value.user.id}`, perfil.value, 'PATCH');
        console.log(userRes)

        // clear file input
        avatarFileInput.value.value = ''
        
        // refrescar auth
        await getSession() // esto funciona pero por algun motivo no es reactivo
        // location.reload(); // asi que lo hacemos asi que es mas feo pero funciona
        toast.add({ severity: 'contrast', detail: 'Perfil guardado', life: 3000});   
    }catch{
        console.error('Error al guardar perfil')
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar tu perfil', life: 3000});
    }finally{
        loading.value = false
    }
}
</script>