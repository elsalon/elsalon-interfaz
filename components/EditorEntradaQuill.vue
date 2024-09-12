<template>
    <ClientOnly fallback-tag="div" fallback="cargando editor">
		<div id="editorContainer" class="grow h-full flex flex-col">
			
			<!-- Editor -->
			<QuillEditor v-model:content="myContent" content-type="html" :modules="editorModules" :toolbar="editorToolbar" theme="snow" @ready="onEditorReady"/>

			<!-- Selector de Autoría -->
			<div class="flex justify-end mt-4 flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-1">
				<Select v-model="autorSeleccionado"  :options="autoresOpciones" optionLabel="name" placeholder="Autoría" class="w-full md:w-56">
					<template #value="slotProps">
						<!-- Seleccionado -->
						<div v-if="slotProps.value" class="flex items-center">
							<img v-if="slotProps.value.avatar" :alt="slotProps.value.label" :src="slotProps.value.avatar" :class="`mr-2`" style="width: 18px" />
							<div>{{ slotProps.value.name }}</div>
						</div>
						<span v-else>
							{{ slotProps.placeholder }}
						</span>
					</template>
					<template #option="slotProps">
						<!-- Lista opciones -->
						<div class="flex items-center">
							<img v-if="slotProps.option.avatar !=null" :alt="slotProps.option.label" :src="slotProps.option.avatar" :class="`mr-2`" style="width: 18px" />
							<div>{{ slotProps.option.name }}</div>
						</div>
					</template>
				</Select>

				<!-- Boton Publicar -->
				<Button @click="Publicar" :loading="uploading">{{isEditing ? 'Guardar' : 'Publicar'}}</Button>
			</div>
        </div>
    </ClientOnly>
</template>

<script setup>
const runtimeConfig = useRuntimeConfig().public;
import { ImageDrop } from 'quill-image-drop-module';
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
const { data } = useAuth()
import Compressor from 'compressorjs';

const toast = useToast();
import { useToast } from "primevue/usetoast";

const attachedImages = ref([])
const uploading = ref(false)

const myContent = ref('')
const quill = ref(null)

const props = defineProps({
  postEdit: { type: Object, default: null } // If provided, we're in edit mode
})
const isEditing = ref(!!props.postEdit)

const editorToolbar = [
	['bold', 'italic', 'underline', 'strike'],
	['blockquote', 'code-block'],
	[{ 'header': 1 }, { 'header': 2 }],
	[{ 'list': 'ordered' }, { 'list': 'bullet' }],
	['link', 'image', 'video'],
	['clean']
]
const editorModules = [
	{
		module: ImageDrop,
		name: 'image-drop',
	}
]

const onEditorReady = (editor) => {
  quill.value = editor
}

const uploadImage = async (file) => {
	const formData = new FormData()
  	const randFilename = useRandomFilenameBlob(file)
	const imageFile = await CompressImage(file)
  	formData.append('file', imageFile, randFilename)
  	try {
		const {doc} = await useUploadFile('/api/imagenes', formData);
		console.log("Response:", doc)
		return { id: doc.id, url: doc.url } // Assuming PayloadCMS returns both id and url
	} catch (error) {
		console.error('Error uploading image:', error)
		toast.add({ severity: 'error', summary: 'Error', detail: 'No se puede subir esa imagen', life: 3000});
		return null
	}
}

const ProcesarContenido = async () => {
	const delta = quill.value.getContents()
	let html = quill.value.root.innerHTML
	// Procesar imagenes
	// Busco todos los blobs de imagenes y las subo
	// Los convierto a formato [image:id] para que el backend lo entienda
	// Si payload cambia la url de la imagen no se pierde la imagen en el contenido
	// Tambien guardo referencia a todas las imagenes del posteo en attachedImages
	for (let op of delta.ops) {
		if (op.insert && op.insert.image) {
			const imageUrl = op.insert.image
			if (imageUrl.startsWith('data:')) {
				console.log(op)
				// This is a base64 image, need to upload
				const file = await fetch(imageUrl).then(res => res.blob())
				const uploadedImage = await uploadImage(file)
				if (uploadedImage) {
					html = html.replace(imageUrl, `[image:${uploadedImage.id}]`)
					console.log("PUshing image", uploadedImage.id)
					attachedImages.value.push({imagen: uploadedImage.id})
				}
			}
		}
	}
	html = html.replace(/<img src="(\[image:[^"]+\])">/g, '$1'); // remuevo los tags img que no necesito

	// Ahora vuelvo a convertir <img src="" data-salonid="123"> en [image:123]
	// Esto es en caso que estuviesemos editando una entrada ya existente
	const imageRegex = /<img src="[^"]+" data-salonid="([^"]+)">/g;
	const matches = [...html.matchAll(imageRegex)]
	for (const match of matches) {
		const tag = match[0]
		const imageId = match[1]
		html = html.replace(tag, `[image:${imageId}]`)
	}

	return html
}

const CompressImage = async(blob) => {
	console.log("Compressing image")
	return new Promise((resolve, reject) => {
        new Compressor(blob, {
          quality: 0.7,
          maxWidth: 1920,
          retainExif: true,

          success(result) {
            resolve(result);
          },
          error(err) {
            console.log(err.message);
            reject(err);
          },
        });
	});
}

const Publicar = async () => {
	uploading.value = true
	const { paginaActual } = useSalon()
	const html = await ProcesarContenido();
	let method ='POST'
	let data = {
		contenido: html, 
		imagenes: attachedImages.value, 
		sala: paginaActual.value.id
	}
	// console.log("DATA", data)	
	let endpoint = '/api/entradas'
	if(isEditing.value){
		method = 'PATCH';
		endpoint = `/api/entradas/${props.postEdit.entrada.id}`
	}
	try{
		const response = await useApi(endpoint, data, method);
		console.log("Publicacion creada:", response)
		useNuxtApp().callHook("publicacion:creada", {resultado:"ok"})
	}catch{
		useNuxtApp().callHook("publicacion:creada", {resultado:"error"})
	}
	uploading.value = false;
	// TODO refrescar lista de entradas desde pagina 0 (sin pisar las existentes)
}

const autorSeleccionado = ref();
const autoresOpciones = ref([]);

const loadExistingContent = async () => {
	const { entrada, html } = props.postEdit
	myContent.value = html
	attachedImages.value = []
	attachedImages.value = entrada.imagenes.map(data => ({imagen: data.imagen.id}))
}

onMounted(() => {
	autoresOpciones.value.push({
		avatar: runtimeConfig.apiBase + data.value?.user?.avatar?.sizes?.thumbnail?.url, 
		name: data.value?.user?.nombre, 
		id: data.value?.user?.id 
	});
	data.value.grupos.forEach(grupo => {
		autoresOpciones.value.push({ 
			avatar: null, // TODO
			name: grupo,
			id: "x"
		});
	});
	if(!autorSeleccionado.value && autoresOpciones.value.length > 0){
		autorSeleccionado.value = autoresOpciones.value[0];
	}

	if (isEditing.value) {
		loadExistingContent()
	}
})
</script>
