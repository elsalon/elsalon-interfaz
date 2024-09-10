<template>
    <form @submit.prevent="handleSubmit" class="space-y-3">
        <div class="flex flex-col gap-2">
            <label for="username">nombre</label>
            <InputText id="username" v-model="perfil.nombre" required minlength="3" />
        </div>
        <div class="flex flex-col gap-2">
            <label for="email">email</label>
            <InputText id="email" type="email" v-model="perfil.email" required/>
        </div>

        <div class="flex flex-col gap-2">
            <label for="avatar">avatar</label>
            <input type="file" id="avatar" ref="avatarFileInput" class="leading-none m-0 py-2 px-3 rounded-md text-surface-800 dark:text-white/80 placeholder:text-surface-400 dark:placeholder:text-surface-500 bg-surface-0 dark:bg-surface-950 border border-surface-300 dark:border-surface-700 invalid:focus:ring-red-200 invalid:hover:border-red-500 hover:border-surface-400 dark:hover:border-surface-600 focus:outline-none focus:outline-offset-0 focus:ring-1 focus:ring-primary-500 dark:focus:ring-primary-400 focus:z-10 appearance-none transition-colors duration-200"/>
        </div>
        
        <div class="text-right">
            <Button type="submit" class="" label="Guardar" :loading="loading" />
        </div>

    </form>

</template>

<script setup>
const {data, getSession } = useAuth()
const loading = ref(false)
const perfil = ref({
    nombre: data.value.user.nombre,
    email: data.value.user.email,
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
            
            console.log(avatarRes)
            
            perfil.value.avatar = avatarRes.doc.id
        }

        // Luego guardamos el perfil
        const userRes = await useApi(`/api/users/${data.value.user.id}`, perfil.value, 'PUT');
        console.log(userRes)

        // clear file input
        avatarFileInput.value.value = ''
        
        // refrescar auth
        await getSession() // esto funciona pero por algun motivo no es reactivo
        // location.reload(); // asi que lo hacemos asi que es mas feo pero funciona
    }catch{
        console.error('Error al guardar perfil')
    }finally{
        loading.value = false
    }


    // loading.value = true
    // try {
    //     await signIn({
    //         email: email.value,
    //         password: password.value
    //     }, {
    //         callbackUrl: '/'
    //     })
    // } catch (error) {
    //     console.error('Login failed:', error)
    //     toast.add({ severity: 'error', summary: 'Error', detail: 'Usuario o contraseña incorrectas', life: 3000});
    // } finally{
    //     loading.value = false
    // }
}
</script>