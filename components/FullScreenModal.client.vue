<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="isOpen" class="fixed inset-0 bg-zinc-100 flex items-center justify-center z-50"
        @click.self="closeModal" @keydown.esc="closeModal" tabindex="0" ref="modalRef">
        <div class="w-full h-full overflow-auto pt-14 md:pt-6 pb-2 flex flex-col">
          <button class="absolute top-6 right-6 flex items-center justify-center transition-colors" text
            @click="closeModal">
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
import { watch, onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:isOpen', 'close']);
const modalRef = ref(null);

const closeModal = () => {
  emit('update:isOpen', false);
  emit('close');
};

// Handle ESC key press globally
const handleEscKey = (event) => {
  if (event.key === 'Escape' && props.isOpen) {
    closeModal();
  }
};

// Store original padding to restore it later
let originalPadding = '';
let scrollbarWatcher = null;

onMounted(() => {
  // Add global event listener for ESC key
  document.addEventListener('keydown', handleEscKey);
});

// Prevent scroll and compensate for scrollbar disappearance
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    // Store original values
    originalPadding = document.body.style.paddingRight;
    
    // Apply initial scrollbar handling
    handleScrollbarCompensation();
    
    // Set up a mutation observer to detect content changes
    if (!scrollbarWatcher) {
      scrollbarWatcher = new MutationObserver(() => {
        // Re-apply scrollbar compensation when content changes
        if (props.isOpen) {
          handleScrollbarCompensation();
        }
      });
      
      // Watch for changes in the modal content
      if (modalRef.value) {
        scrollbarWatcher.observe(modalRef.value, { 
          childList: true, 
          subtree: true,
          attributes: true,
          characterData: true 
        });
      }
    }
    
    // Focus modal for accessibility
    if (modalRef.value) {
      modalRef.value.focus();
    }
  } else {
    // Stop watching for changes when modal is closed
    if (scrollbarWatcher) {
      scrollbarWatcher.disconnect();
      scrollbarWatcher = null;
    }
    
    // Restore original state
    document.body.classList.remove('modal-open');
    document.body.style.setProperty('padding-right', originalPadding);
  }
}, { immediate: true });

// Helper function to handle scrollbar compensation
const handleScrollbarCompensation = () => {
  console.log('Handling scrollbar compensation...');
  
  // Ensure we're applying these styles directly and with !important
  document.body.classList.add('modal-open');
  
  // First, measure if we have a scrollbar before changing any styles
  const hasScrollbar = window.innerWidth > document.documentElement.clientWidth;
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  
  console.log('Has scrollbar:', hasScrollbar, 'width:', scrollbarWidth);
  
  // Add padding to compensate for scrollbar removal
  if (hasScrollbar && scrollbarWidth > 0) {
    document.body.style.setProperty('padding-right', `${scrollbarWidth}px`, 'important');
  }
};

// Clean up when component is unmounted
onBeforeUnmount(() => {
  document.body.classList.remove('modal-open');
  document.body.style.paddingRight = originalPadding;
  document.removeEventListener('keydown', handleEscKey);
  
  if (scrollbarWatcher) {
    scrollbarWatcher.disconnect();
    scrollbarWatcher = null;
  }
});
</script>

<style>
/* Global style to prevent scrolling when modal is open */
body.modal-open {
  overflow: hidden !important;
}

/* Your existing scoped styles */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>