<template>
    <form @submit.prevent="handleSubmit" class="space-y-3">
        <div class="flex gap-2 mb-4 flex-col md:flex-row">
            <label for="nombre" class="font-semibold md:w-1/3">nombre y apellido</label>
            <InputText id="nombre" class="w-full" v-model="perfil.nombre" required minlength="3" autofocus />
        </div>

        <div class="flex gap-2 mb-4 flex-col md:flex-row">
            <label for="avatar" class="font-semibold md:w-1/3">autorretrato</label>
            <input type="file" id="avatar" ref="avatarFileInput" accept="image/png, image/gif, image/jpeg"  class="w-full caja-input"/>
        </div>

        <div class="flex gap-2 mb-4 mt-0 flex-col md:flex-row">
            <label for="email" class="font-semibold md:w-1/3">email</label>
            <InputText id="email" class="w-full" type="email" v-model="perfil.email" required/>
        </div>

        <div class="flex gap-2 mb-4 mt-0 flex-col md:flex-row">
            <label for="mostrarEmail" class="font-semibold md:w-1/3">mostrar email</label>
            <Checkbox inputId="mostrarEmail" id="mostrarEmail" class="w-full" v-model="perfil.mostrarEmail" binary />
        </div>

        <div class="flex gap-2 mb-4 mt-0 flex-col md:flex-row">
            <label for="link" class="font-semibold md:w-1/3">link</label>
            <InputText id="link" class="w-full" type="link" v-model="perfil.link"/>
        </div>

        <div class="flex gap-2 mb-10 flex-col md:flex-row">
            <label for="bio" class="font-semibold md:w-1/3">bio</label>
            <Textarea id="bio" class="w-full leading-normal" v-model="perfil.bio" rows="5" cols="30" />
        </div>

        <div :class="{'opacity-50':password==''}">
            <div class="text-sm mt-10 mb-3">Si no querés cambiar tu contraseña, dejá estos campos vacíos</div>
            
            <div class="flex gap-2 mb-4 mt-0 flex-col md:flex-row">
                <label for="password" class="font-semibold md:w-1/3">nueva contraseña</label>
                <Password id="password" class="w-full" fluid toggleMask :feedback="false" v-model="password" :required="password!=''"/>
            </div>
        
            <div class="flex gap-2 mb-4 mt-0 flex-col md:flex-row">
                <label for="password2" class="font-semibold md:w-1/3">repetí contraseña</label>
                <Password id="password2" class="w-full" fluid :feedback="false" v-model="password2" :required="password!=''"/>
            </div>
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
    mostrarEmail: data.value.user.mostrarEmail,
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