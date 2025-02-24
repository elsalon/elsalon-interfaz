<template>
    <Transition name="slide-fade">
        <div class="entradasNuevasNotification" v-if="visible">
            <div @click="IrAEntradasRecientes" class="text-white hover:text-zinc-500">Ver entradas nuevas</div>
            <div @click="Ocultar"><i class="pi pi-times text-white hover:text-zinc-500" style="font-size: .6rem;"></i>
            </div>
        </div>
    </Transition>
</template>

<script setup>
const visible = ref(false)

const Mostrar = () => {
    visible.value = true
}

const Ocultar = () => {
    visible.value = false
}

const primeraEntradaNueva = ref(null)

const IrAEntradasRecientes = () => {
    console.log('Ir a entradas recientes')
    primeraEntradaNueva.value = document.querySelector('.entradaNueva');
    if (primeraEntradaNueva.value) {
        console.log('Scrolling to first new entry')
        primeraEntradaNueva.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    Ocultar()
}

const handleScroll = () => {
  if (primeraEntradaNueva.value) {
    const position = primeraEntradaNueva.value.getBoundingClientRect();
    if (position.top < window.innerHeight && position.bottom >= 0) {
      Ocultar();
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
})

defineExpose({
    Mostrar
})

</script>
<style scoped>
.entradasNuevasNotification {
  @apply flex bg-zinc-500 space-x-2 text-white text-xs px-2 py-1 rounded-full;
  z-index: 9999;
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);

  &:hover {
      cursor: pointer;
  }
}
</style>
