<template>
    <Select v-model="selectedValue" placeholder="Cargando..." :loading="salonStore.gruposDelUsuarioFetching" :options="autoresOpciones" optionLabel="name" :disabled="disableSelectorIdentidad" 
        :class="{ 'w-full md:w-56': !props.esComentario, 'text-xs': props.esComentario }">
        <template #value="slotProps">
            <!-- Seleccionado -->
            <div v-if="slotProps.value" class="flex items-center">
                <template v-if="slotProps.value.avatar">
                    <img v-if="slotProps.value.avatar" :alt="slotProps.value.label" :src="slotProps.value.avatar"
                        :class="`mr-2`" style="width: 18px" />
                </template>
                <template v-else>
                    <AvatarSalon :usuario="slotProps.value" class="w-5 h-5 mr-2 text-xs" />
                </template>
                <div class="flex-grow" v-show="!props.esComentario">{{ slotProps.value.nombre }}</div>
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
                        :src="slotProps.option.avatar" class="mr-2" style="width: 18px" />
                </template>
                <template v-else>
                    <AvatarSalon :usuario="slotProps.option" class="w-5 h-5 mr-2 text-xs" />
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

const { data: authData } = useAuth();
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
});

const autoresOpciones = ref([]);
const disableSelectorIdentidad = ref(false);

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
        avatar: authData.value.user.avatar ? authData.value.user.avatar.sizes.thumbnail.url : null,
        nombre: authData.value?.user?.nombre,
        id: authData.value?.user?.id
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

    if(!props.esComentario){
        if (salonStore.currContext == "bitacora") {
            selectedValue.value = autoresOpciones.value.find(autor => autor.id == authData.value.user.id);
            disableSelectorIdentidad.value = true;
        } else if (salonStore.currContext == "grupo") {
            selectedValue.value = autoresOpciones.value.find(autor => autor.id == contextoId);
            disableSelectorIdentidad.value = true;
        }
    }
});
</script>