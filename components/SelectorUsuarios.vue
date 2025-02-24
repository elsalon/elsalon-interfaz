<template>
    <AutoComplete 
        v-model="internalValue" 
        inputId="multiple-ac-1" 
        multiple 
        fluid 
        :suggestions="sugerenciasUsuarios"
        @complete="busquedaUsuarios"
        emptySearchMessage="No se encontraron usuarios"
        placeholder="Escribí sus nombres para buscar"
    >
        <!-- Lista de usuarios elegidos -->
        <template #chip="slotProps">
            <div class="flex items-center">
                <template v-if="slotProps.value.avatar">
                    <Chip 
                        :label="slotProps.value.nombre" 
                        :image="slotProps.value.avatar.sizes.thumbnail.url" 
                        removable
                        @remove="itemRemoved(slotProps)" 
                    />
                </template>
                <template v-else>
                    <Chip 
                        :label="slotProps.value.nombre" 
                        removable 
                        @remove="itemRemoved(slotProps)" 
                    />
                </template>
            </div>
        </template>
        <!-- Lista de usuarios en la búsqueda -->
        <template #option="slotProps">
            <div class="flex items-center">
                <template v-if="slotProps.option.avatar">
                    <img 
                        :alt="slotProps.option.name" 
                        :src="slotProps.option.avatar.sizes.thumbnail.url"
                        class="w-6 h-6" 
                    />
                </template>
                <template v-else>
                    <div class="w-6 h-6">
                        <AvatarSalon :usuario=" slotProps.option" class="w-6 h-6" size="" style="font-size:.5rem" />
                    </div>
                </template>
                <div class="flex-grow ml-2">{{ slotProps.option.nombre }}</div>
            </div>
        </template>
    </AutoComplete>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    modelValue: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['update:modelValue'])
const sugerenciasUsuarios = ref([])
// Define an internal ref for the model value
const internalValue = ref([...props.modelValue])

// Watch the prop and update the internal value if it changes
watch(
    () => props.modelValue,
    (newValue) => {
        // Only update internalValue if props.modelValue is different
        if (JSON.stringify(newValue) !== JSON.stringify(internalValue.value)) {
            internalValue.value = [...newValue]
        }
    }
)

// Emit updates when internalValue changes
watch(internalValue, (newValue) => {
    // Only emit if internalValue is different from modelValue
    if (JSON.stringify(newValue) !== JSON.stringify(props.modelValue)) {
        emit('update:modelValue', newValue)
    }
})

// Async function to search for users
const busquedaUsuarios = async (event) => {
    if (event.query.length < 3) {
        return
    }
    // console.log("Buscando", event.query)
    const { docs } = await useAPI(
        `/api/users?where[nombre][contains]=${event.query}&limit=10`
    )
    sugerenciasUsuarios.value = docs
}

// Function to remove a selected item
const itemRemoved = (item) => {
    internalValue.value = internalValue.value.filter(
        (usuario) => usuario.id !== item.value.id
    )
}
</script>
