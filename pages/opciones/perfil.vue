<template>
    <form @submit.prevent="handleSubmit" class="space-y-3">
        <div class="flex gap-2 mb-4 flex-col md:flex-row">
            <label for="username" class="font-semibold w-24">nombre</label>
            <InputText id="username" class="w-full" v-model="perfil.nombre" required minlength="3" autofocus />
        </div>

        <div class="flex gap-2 mb-4 mt-0 flex-col md:flex-row">
            <label for="email" class="font-semibold w-24">email</label>
            <InputText id="email" class="w-full" type="email" v-model="perfil.email" required/>
        </div>

        <div class="flex gap-2 mb-4 flex-col md:flex-row">
            <label for="avatar" class="font-semibold w-24">avatar</label>
            <input type="file" id="avatar" ref="avatarFileInput" class="w-full caja-input"/>
        </div>

        <div class="flex gap-2 mb-10 flex-col md:flex-row">
            <label for="bio" class="font-semibold w-24">bio</label>
            <Textarea id="bio" class="w-full leading-normal" v-model="perfil.bio" autoResize rows="5" cols="30" />
        </div>

        <div class="flex gap-2 mb-4 mt-0 flex-col md:flex-row">
            <label for="link" class="font-semibold w-24">link</label>
            <InputText id="link" class="w-full" type="link" v-model="perfil.link"/>
        </div>

        <div :class="{'opacity-50':password==''}">
            <div class="text-sm mt-10">Si no querés cambiar tu contraseña, dejá estos campos vacíos</div>
            
                <label for="contraseña" class="font-semibold w-24">nueva contraseña</label>
                <InputText id="contraseña" class="w-full" type="password" v-model="password" :required="password!=''"/>
            
                <label for="contraseña" class="font-semibold w-24">repetí contraseña</label>
                <InputText id="contraseña" class="w-full" type="password" v-model="password2" :required="password!=''"/>
            
        </div>
        
        <div class="text-right mb-10">
            <Button type="submit" class="" label="Guardar" :loading="loading" />
        </div>

    </form>

</template>

<script setup>
const salonStore = useSalonStore();
salonStore.SetPageTitle(`Perfil`)

const toast = useToast();
import { useToast } from "primevue/usetoast";
const {data, getSession } = useAuth()
const loading = ref(false)
const password = ref('')
const password2 = ref('')

const perfil = ref({
    nombre: data.value.user.nombre,
    email: data.value.user.email,
    bio: data.value.user.bio,
    link: data.value.user.link,
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

        // Luego chequeamos si hay que cambiar la contraseña
        if(password.value != ''){
            // TODO Pedir contraseña actual
            // Pero en payload no encontré manera de validar la contraseña actual
            if(password.value == password2.value){
                perfil.value.password = password.value
            }else{
                toast.add({ severity: 'error', summary: 'Error', detail: 'Las contraseñas no coinciden', life: 3000});
                return;
            }
        }
        

        // Luego guardamos el perfil
        const userRes = await useAPI(`/api/users/${data.value.user.id}`, {body: perfil.value, method: 'PATCH'});
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