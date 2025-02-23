<template>
    <Select v-model="selectedValue" :loading="salonStore.gruposDelUsuarioFetching" :options="autoresOpciones"
        optionLabel="name" :disabled="disableSelectorIdentidad || loading" :class="{ 'text-xs': props.esComentario }"
        :pt="SelectStyleProperties">
        <template #value="slotProps">
            <!-- Seleccionado -->
            <div v-if="slotProps.value" class="flex items-center">
                <template v-if="slotProps.value.avatar">
                    <img v-if="slotProps.value.avatar" :alt="slotProps.value.label" :src="slotProps.value.avatar"
                        class="mr-2 w-6 h-6"  />
                </template>
                <template v-else>
                    <AvatarSalon :usuario="slotProps.value" class="w-5 h-5 mr-2" size="small" style="font-size:.5rem"/>
                </template>
            </div>
            <span v-else>
                {{ slotProps.placeholder }}
            </span>
        </template>
        <template #option="slotProps">
            <!-- Lista opciones -->
            <div class="flex items-center" :class="{ 'text-xs': props.esComentario }">
                <template v-if="slotProps.option.avatar">
                    <img v-if="slotProps.option.avatar != null" :alt="slotProps.option.label"
                        :src="slotProps.option.avatar" class="mr-2 w-6 h-6"  />
                </template>
                <template v-else>
                    <AvatarSalon :usuario="slotProps.option" class="w-5 h-5 mr-2" size="small" style="font-size:.5rem" />
                </template>
                <div class="flex-grow">{{ slotProps.option.nombre }}</div>
            </div>
        </template>
        <template #footer>
            <NuxtLink to="/opciones/grupos" target="_blank" v-if="salonStore.gruposDelUsuario.length == 0">
                <div class="px-3 py-1 text-gray-400 hover:underline text-sm">Aprendé cómo publicar como grupo</div>
            </NuxtLink>
        </template>
    </Select>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const auth = useAuth();
const salonStore = useSalonStore();
const props = defineProps({
    modelValue: {
        type: Object,
        default: null,
    },
    esComentario: {
        type: Boolean,
        default: false,
    },
    loading: {
        type: Boolean,
        default: false,
    },
});

const autoresOpciones = ref([]);
const disableSelectorIdentidad = ref(false);
const contextoId = salonStore.contextoId;

const emit = defineEmits(["update:modelValue"]);

const selectedValue = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit("update:modelValue", value);
    },
});

onMounted(async () => {
    await salonStore.FetchGruposDelUsuario();

    autoresOpciones.value.push({
        avatar: auth.data.value.user.avatar ? auth.data.value.user.avatar.sizes.thumbnail.url : null,
        nombre: auth.data.value?.user?.nombre,
        id: auth.data.value?.user?.id
    });

    salonStore.gruposDelUsuario.forEach(grupo => {
        autoresOpciones.value.push({
            avatar: grupo.avatar ? grupo.avatar.sizes.thumbnail.url : null,
            nombre: grupo.nombre,
            id: grupo.id
        });
    });

    if (!selectedValue.value && autoresOpciones.value.length > 0) {
        selectedValue.value = autoresOpciones.value[0];
    }

    if (!props.esComentario) {
        if (salonStore.currContext == "bitacora") {
            selectedValue.value = autoresOpciones.value.find(autor => autor.id == auth.data.value.user.id);
            disableSelectorIdentidad.value = true;
        } else if (salonStore.currContext == "grupo") {
            selectedValue.value = autoresOpciones.value.find(autor => autor.id == contextoId);
            disableSelectorIdentidad.value = true;
        }
    }
});

let SelectStyleProperties = {
    dropdown: ['flex items-center justify-center',
        'shrink-0',
        // Color and Background
        'bg-transparent',
        'text-surface-500',
        // Size
        'w-6',
    ], label: ['leading-[normal]',

        // Display
        'block',
        'flex-auto',

        // Color and Background
        'bg-transparent',
        'border-0',
        'placeholder:text-surface-400 dark:placeholder:text-surface-500',

        // Sizing and Spacing
        'w-[1%]',
        'py-2 pr-0 pl-2',

        //Shape
        'rounded-none',

        // Transitions
        'transition',
        'duration-200',

        // States
        'focus:outline-none focus:shadow-none',

        // Filled State *for FloatLabel

        // Misc
        'relative',
        'cursor-pointer',
        'overflow-hidden overflow-ellipsis',
        'whitespace-nowrap',
        'appearance-none']
}
</script>