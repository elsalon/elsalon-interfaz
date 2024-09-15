<template>
    <ClientOnly>
    <Dialog :visible="visible" header="Edit Profile" :style="{ width: '25rem' }" position="top" :draggable="true" @update:visible="$emit('update:visible', $event)">
        <pre>{{ notifications }}</pre>
        <span class="text-surface-500 dark:text-surface-400 block mb-8">Update your information.</span>
        <div class="flex items-center gap-4 mb-4">
            <label for="username" class="font-semibold w-24">Username</label>
            <InputText id="username" class="flex-auto" autocomplete="off" />
        </div>
        <div class="flex items-center gap-4 mb-8">
            <label for="email" class="font-semibold w-24">Email</label>
            <InputText id="email" class="flex-auto" autocomplete="off" />
        </div>
        <div class="flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="closeDialog"></Button>
            <Button type="button" label="Save" @click="closeDialog"></Button>
        </div>
    </Dialog>
    </ClientOnly>
</template>

<script setup>
import { defineEmits } from 'vue'

const { notifications, totalNotifications } = useNotifications()

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    }
})

const emit = defineEmits(['update:visible'])

const closeDialog = () => {
    emit('update:visible', false)
}
</script>