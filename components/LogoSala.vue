<template>
    <div class="logoContainer relative inline-flex group/logosala" @click="LoadImage" >
        
        <Avatar v-if="salon?.avatar" :image="AvatarUrl()" size="xlarge" shape=""/>
        <Avatar v-else :label="salon?.siglas" class="select-none cursor-pointer" :style="{backgroundColor: salon.color, color: '#fff'}" size="xlarge" shape=""/>

        <div v-if="puedeEditar" class="absolute bottom-0 right-1 opacity-0 group-hover/logosala:opacity-100" style="font-size: .7rem;">
            <i class="pi pi-upload"></i>
        </div>
    </div>

    <form ref="form" class="hidden">
        <input type="file" @change="onFileChange" ref="fileInput" accept="image/*" />
    </form>

</template>

<script setup>
const toast = useToast();
const props = defineProps({
    salon: { type: Object, required: true }
})
const fileInput = ref()
const { data: authData } = useAuth()
const puedeEditar = authData.value?.user?.rol == 'docente' || authData.value?.user?.isAdmin;
const salonStore = useSalonStore()
const key = ref(0)

const LoadImage = () => {
    if (!puedeEditar) return
    fileInput.value.click()
}

const runtimeConfig = useRuntimeConfig().public;

const onFileChange = async (e) => {
    // Subo la imagen a avatares
    const avatarFile = fileInput.value.files[0]
    const formData = new FormData()
    formData.append('file', avatarFile)
    const avatarRes = await useUploadFile('/api/avatares', formData);
    // Ahora actualizo la sala
    const salonRes = await useApi(`/api/salones/${props.salon.id}`, {avatar: avatarRes.doc.id}, 'PATCH');
    if(salonRes.error){
        toast.add({severity: 'error', summary: 'Error', detail: salonRes.error})
    }else{
        toast.add({severity: 'contrast', summary: 'Avatar actualizado', detail: 'El avatar de la sala ha sido actualizado'})
        salonStore.UpdateSala(salonRes.doc)
        props.salon.avatar = salonRes.doc.avatar; // Update the avatar field
        key.value++; // Trigger re-render
    }
}

const AvatarUrl = () => {
    return runtimeConfig.apiBase + props.salon.avatar.sizes.medium.url;
}

</script>