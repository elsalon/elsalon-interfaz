<template>
   <Teleport to="body">
    <transition name="modal-fade">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 bg-zinc-100 flex items-center justify-center z-50" 
        @click.self="closeModal"
      >
        <div class="w-full h-full overflow-auto pt-14 md:pt-6 pb-2 flex flex-col">
          <button 
            class="absolute top-6 right-6 flex items-center justify-center transition-colors" 
            text @click="closeModal"
          >
            <i class="pi pi-times"></i>
          </button>
          <div class="flex flex-grow items-center justify-center">
            <slot></slot>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { watch, onBeforeUnmount, onMounted } from 'vue';

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:isOpen', 'close']);

const closeModal = () => {
    emit('update:isOpen', false);
    emit('close');
};

// Store original padding to restore it later
let originalPadding = '';

// Calculate scrollbar width on mount to use it later
let scrollbarWidth = 0;
onMounted(() => {
        // Calculate scrollbar width
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';
        document.body.appendChild(outer);

        const inner = document.createElement('div');
        outer.appendChild(inner);

        scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
        outer.parentNode.removeChild(outer);
    
});

// Prevent scroll and compensate for scrollbar disappearance
watch(() => props.isOpen, (isOpen) => {
    if (isOpen) {
        // Store original padding
        originalPadding = document.body.style.paddingRight;

        // Add padding equal to scrollbar width to prevent content shift
        const hasScrollbar = window.innerWidth > document.documentElement.clientWidth;
        if (hasScrollbar) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        // Disable scroll
        document.body.style.overflow = 'hidden';
    } else {
        // Restore original state
        document.body.style.overflow = '';
        document.body.style.paddingRight = originalPadding;
    }

}, { immediate: true });

// Clean up when component is unmounted
onBeforeUnmount(() => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = originalPadding;
    
});
</script>

<style scoped>
/* Fade transition - keeping this as regular CSS since transitions are cleaner this way */
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}
</style>