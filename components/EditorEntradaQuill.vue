<template>
    <ClientOnly fallback-tag="div" fallback="cargando editor">
		<!-- Editor -->
        <QuillEditor v-model:content="myContent" :options="editorOptions" @ready="onEditorReady"/>

		<!-- Selector de Autoría -->
        <div class="flex justify-end mt-4 flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-1">
			<Select v-model="autorSeleccionado" :options="autoresOpciones" optionLabel="name" placeholder="Autoría" class="w-full md:w-56">
				<template #value="slotProps">
					<div v-if="slotProps.value" class="flex items-center">
						<img :alt="slotProps.value.label" src="https://primefaces.org/cdn/primevue/images/flag/flag_placeholder.png" :class="`mr-2`" style="width: 18px" />
						<div>{{ slotProps.value.name }}</div>
					</div>
					<span v-else>
						*{{ slotProps.placeholder }}*
					</span>
				</template>
				<template #option="slotProps">
					<div class="flex items-center">
						<img :alt="slotProps.option.label" src="https://primefaces.org/cdn/primevue/images/flag/flag_placeholder.png" :class="`mr-2`" style="width: 18px" />
						<div>{{ slotProps.option.name }}</div>
					</div>
				</template>
			</Select>

			<!-- Boton Publicar -->
			<Button @click="Publicar">Publicar</Button>
        </div>
    </ClientOnly>
</template>

<script setup>
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
const { data } = useAuth()

const myContent = ref('')
const quill = ref(null)
const editorOptions = {
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image', 'video'],
      ['clean']
    ]
  }
}

const onEditorReady = (editor) => {
  quill.value = editor
}

const Publicar = async () => {
    const delta = quill.value.getContents()
    let html = quill.value.root.innerHTML
    console.log('Publicar', delta, html)

    const response = await useApi('api/entradas', {contenido: html}, 'POST');
    console.log('Content submitted successfully:', response)

	// TODO cerrar ventana y refrescar lista de entradas desde pagina 0
}

const autorSeleccionado = ref();
const autoresOpciones = ref([]);

onMounted(() => {
	autoresOpciones.value.push({ name: data.value?.user?.nombre, id: data.value?.user?.id });
	data.value.grupos.forEach(grupo => {
		autoresOpciones.value.push({ name: grupo, id: "x" });
	});
	if(!autorSeleccionado.value && autoresOpciones.value.length > 0){
		autorSeleccionado.value = autoresOpciones.value[0];
	}
})

</script>