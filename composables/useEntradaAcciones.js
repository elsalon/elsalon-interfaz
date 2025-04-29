export const useEntradaAcciones = (entrada, emit) => {
  const loading = ref(false);
  const toast = useToast();
  const confirm = useConfirm();

  const CopiarLink = () => {
    const url = `${window.location.origin}/entradas/${entrada.id}`;
    navigator.clipboard.writeText(url);
    toast.add({ severity: 'contrast', detail: 'Link copiado', life: 3000 });
  };

  const DestacarEntrada = async () => {
    loading.value = true;
    try {
      const res = await useAPI(`/api/entradas/${entrada.id}/destacar`, { method: "PATCH" });
      entrada.destacada = res.destacada;
      const message = res.destacada ? 'Entrada destacada' : 'Destacado eliminado';
      toast.add({ severity: 'contrast', detail: message, life: 3000 });
    } catch(e) {
      console.warn(e);
      toast.add({ severity: 'error', summary: 'Error', detail: 'Hubo un error destacando la entrada', life: 3000 });
    } finally {
      loading.value = false;
    }
  };

  const FijarEntrada = async () => {
    loading.value = true;
    try {
      if (entrada.fijada) {
        await useAPI(`/api/fijadas/${entrada.fijada}`, { method: 'DELETE' });
        toast.add({ summary: 'Entrada desfijada', severity: 'contrast', life: 3000 });
        useNuxtApp().callHook("entrada:desfijada", { entrada });
      } else {
        useNuxtApp().callHook("entrada:fijar", { entrada });
      }
    } finally {
      loading.value = false;
    }
  };

  const EliminarEntrada = () => {
    confirm.require({
      message: 'Estás seguro de borrar esta entrada?',
      header: 'Borrar entrada',
      rejectProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      acceptProps: { label: 'Borrar', severity: 'danger' },
      reject: () => console.log('Borrar entrada cancelada'),
      accept: async () => {
        loading.value = true;
        try {
          await useAPI(`/api/entradas/${entrada.id}`, { method: 'DELETE' });
          emit('eliminar');
          toast.add({ severity: 'contrast', detail: 'Entrada borrada', life: 3000 });
        } catch(e) {
          console.warn(e);
          toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la entrada', life: 3000 });
        } finally {
          loading.value = false;
        }
      },
    });
  };

  return {
    loading,
    CopiarLink,
    DestacarEntrada,
    FijarEntrada,
    EliminarEntrada
  };
};