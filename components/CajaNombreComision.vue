<template>
    <div class="inline">
        <Inplace
            v-if="canEdit"
            :active="editing"
            @open="OnOpen"
            :closable="true"
            class="inline"
        >
            <template #display>
                {{ nombre }}
            </template>
            <template #content>
                <span class="inline-flex items-center gap-2">
                    <InputText
                        v-model="nombre"
                        autofocus
                        size="small"
                        style="width: 150px; text-align: center;"
                        :disabled="loading"
                    />
                    <Button
                        icon="pi pi-check"
                        text
                        severity="contrast"
                        @click="saveChanges"
                        :disabled="loading"
                    />
                    <i v-if="loading" class="pi pi-spin pi-spinner text-sm"></i>
                </span>
            </template>
        </Inplace>
        <span v-else>{{ nombre }}</span>
    </div>
</template>


<script setup>
const auth = useAuth()
const canEdit = auth.data.value?.user?.rol === 'docente' || auth.data.value?.user?.isAdmin
const router = useRouter()
const route = useRoute()
const toast = useToast();

const props = defineProps({
    comision: Object,
    required: true
});
const nombre = ref(props.comision.nombre);

const editing = ref(false);
const loading = ref(false);

const OnOpen = () => {
    editing.value = true
}

// Save changes on button click, then close
const saveChanges = async () => {
    loading.value = true
    try {
        const body = { nombre: nombre.value }
        const res = await useAPI(`/api/comisiones/${props.comision.id}`, { body, method: "PATCH" })
        toast.add({ severity: 'contrast', detail: 'Comisión actualizada', life: 3000 })
        const newSlug = res.doc.slug
        console.log("slug", newSlug)
        // Replace url
        // Replace URL if slug changed
        if (newSlug !== props.comision.slug) {
            const newPath = route.fullPath.replace(props.comision.slug, newSlug)
            router.replace(newPath)
        }
        editing.value = false
    } catch (e) {
        console.log(e)
    } finally {
        loading.value = false
    }
}

// Use this only for cancel if needed (only if not loading)
const OnClose = () => {
    if (!loading.value) editing.value = false
}
</script>