<template>
    <div class="relative group/guardar w-max flex mr-4">
        <!-- Btn Guardar  -->
        <div class="relative">
            <Button link class="!p-1 text-xs text-zinc-600 dark:text-zinc-400 leading-normal"
                :class="{ 'font-bold text-zinc-800 dark:text-zinc-200': haGuardado }" style="padding: 0"
                :label="tooltipText" @click="handleGuardarClicked($event)" />
            <div v-show="showAnim"
                class="absolute top-[8px] left-0 text-xs text-zinc-800/80 dark:text-zinc-300/80 font-mono custom-ping">
                {{ currentCategoryLabel }}</div>
        </div>

        <!-- Category Selector Menu -->
        <Menu ref="categoryMenu" :model="categoryMenuItems" class="text-xs" :popup="true" />
    </div>
</template>


<script setup>
import qs from 'qs';
const { data: authData } = useAuth();
const mixpanel = useMixpanel();
const toast = useToast();

const props = defineProps({
    guardadoPorUsuario: {
        // category slug when saved, otherwise null
        type: String,
        default: null,
    },
    contenidoid: {
        type: String,
        required: true,
    },
    contenidotipo: {
        type: String,
        required: true,
    },
});

const savedCategory = ref(props.guardadoPorUsuario);
const haGuardado = computed(() => !!savedCategory.value);

const fetching = ref(false);
const showAnim = ref(false);
const selectedCategory = ref(null);
const categoryMenu = ref(null);

const categories = [
    { label: 'Referencias', value: 'referencias' },
    { label: 'Técnicas', value: 'tecnicas' },
    { label: 'Ideas', value: 'ideas' },
    { label: 'Lecturas', value: 'lecturas' },
];

const categoryMenuItems = computed(() =>
    categories.map((cat) => ({
        label: cat.label,
        command: () => selectCategory(cat.value),
    }))
);

const currentCategoryLabel = computed(() =>
    categories.find((c) => c.value === savedCategory.value)?.label || ''
);

const tooltipText = computed(() => {
    if (haGuardado.value) {
        return currentCategoryLabel.value;
    }
    return 'Guardar';
})

const handleGuardarClicked = async (event) => {
    if (fetching.value) {
        return;
    }

    // If already saved, delete directly
    if (haGuardado.value) {
        fetching.value = true;
        const previousCategory = savedCategory.value;
        savedCategory.value = null;
        let didSucceed = false;
        try {
            console.log('Eliminando guardado', props.contenidoid)
            const queryParams = qs.stringify({
                where: {
                    and: [
                        { contenidoid: { equals: props.contenidoid } },
                        { autor: { equals: authData.value.user.id } },
                    ]
                }
            }, { encode: false })

            const res = await useAPI(`/api/guardado?${queryParams}`, { method: 'DELETE' })
            console.log(res)
            didSucceed = true;

            mixpanel.track('Guardado eliminado', { contenidoid: props.contenidoid, contenidotipo: props.contenidotipo })
        } catch (e) {
            console.log(e)
        } finally {
            if (!didSucceed) {
                savedCategory.value = previousCategory;
                toast.add({
                    severity: 'error',
                    summary: 'Error al guardar',
                    detail: 'No se pudo completar la operación. Intentá nuevamente.',
                    life: 3000
                });
            }
            fetching.value = false;
        }
        return;
    }

    // If not saved yet, show category selector
    categoryMenu.value.toggle(event);
}

const selectCategory = async (categoryValue) => {
    if (fetching.value) {
        return;
    }
    fetching.value = true;
    categoryMenu.value.hide();
    selectedCategory.value = categoryValue;

    // Optimistic update: remember previous category, set new
    const previousCategory = savedCategory.value;
    savedCategory.value = categoryValue;
    let didSucceed = false;
    try {
        ActivateAnim();

        console.log('Creando guardado con categoría', props.contenidoid, categoryValue)
        const body = { contenidoid: props.contenidoid, contenidotipo: props.contenidotipo, categoria: categoryValue }
        const res = await useAPI(`/api/guardado/`, { body, method: 'POST' })
        console.log(res)
        didSucceed = !!(res && res.doc && res.doc.id);

        mixpanel.track('Guardado', { contenidoid: props.contenidoid, contenidotipo: props.contenidotipo, categoria: categoryValue })
    } catch (e) {
        console.log(e)
    } finally {
        // If the operation failed or didn't validate, revert UI to previous state
        if (!didSucceed) {
            savedCategory.value = previousCategory;
            toast.add({
                severity: 'error',
                summary: 'Error al guardar',
                detail: 'No se pudo completar la operación. Intentá nuevamente.',
                life: 3000
            });
        }
        fetching.value = false;
    }
}


const ActivateAnim = () => {
    showAnim.value = true;
    setTimeout(() => {
        showAnim.value = false;
    }, 650)
}
</script>