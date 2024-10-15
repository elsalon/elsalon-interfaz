<template>
    <ClientOnly fallback-tag="div" fallback="cargando editor">
		<div id="editorContainer" class="grow h-full flex flex-col">
			
			<!-- Editor -->
			<QuillEditor v-model:content="myContent" content-type="html" :modules="editorModules" toolbar="#toolbar" theme="snow" @ready="onEditorReady">
				<template #toolbar>
					<div id="toolbar">
						<button class="ql-bold"></button>
						<button class="ql-italic"></button>
						<button class="ql-underline mr-2"></button>
						<button class="ql-strike"></button>
						
						<div style="width: 15px;"></div>
						
						<button class="ql-blockquote"></button>
						<button class="ql-code-block"></button>
						<button class="ql-header" value="1"></button>
						<div style="width: 15px;"></div>

						<button class="ql-list" value="ordered"></button>
						<button class="ql-list" value="bullet"></button>
						<div style="width: 15px;"></div>
						<button class="ql-link"></button>
						<button class="ql-image"></button>
						<button class="ql-video"></button>
						<button class="ql-upload" @click="handleAttachFile"><i class="pi pi-cloud-upload"></i></button>
						<div style="width: 15px;"></div>
						<button class="ql-clean"></button>
					</div>
				</template>

			</QuillEditor>
			
			<!-- Lista de archivos adjuntos -->
			<div class="">

				<input type="file" ref="fileInput" style="display: none;" @change="handleFileChange" />
				<div v-for="f in attachedFiles">
					{{ f.name }}
					<button @click="attachedFiles.splice(attachedFiles.indexOf(f), 1)">X</button>
				</div>
			</div>


			<!-- Selector de Autoría -->
			<div class="flex justify-end mt-4 flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-1">
				<Select v-model="autorSeleccionado"  :options="autoresOpciones" optionLabel="name" placeholder="Autoría" class="w-full md:w-56">
					<template #value="slotProps">
						<!-- Seleccionado -->
						<div v-if="slotProps.value" class="flex items-center">
							<template v-if="slotProps.value.avatar">
								<img v-if="slotProps.value.avatar" :alt="slotProps.value.label" :src="slotProps.value.avatar" :class="`mr-2`" style="width: 18px" />
							</template>
							<template v-else>
								<div class="w-6 h-6"></div>
							</template>
							<div class="flex-grow">{{ slotProps.value.name }}</div>
						</div>
						<span v-else>
							{{ slotProps.placeholder }}
						</span>
					</template>
					<template #option="slotProps">
						<!-- Lista opciones -->
						<div class="flex items-center">
							<template v-if="slotProps.option.avatar">
								<img v-if="slotProps.option.avatar !=null" :alt="slotProps.option.label" :src="slotProps.option.avatar" :class="`mr-2`" style="width: 18px" />
							</template>
							<template v-else>
								<div class="w-6 h-6"></div>
							</template>
							<div class="flex-grow">{{ slotProps.option.name }}</div>
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
import { ImageDrop } from 'quill-image-drop-module';
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
const {data: authData} = useAuth()
import Compressor from 'compressorjs';
const fileInput = ref(null)

const toast = useToast();
import { useToast } from "primevue/usetoast";

const attachedImages = ref([])
const attachedFiles = ref([])
const uploading = ref(false)

const myContent = ref('')
const quill = ref(null)

const props = defineProps({
  postEdit: { type: Object, default: null } // If provided, we're in edit mode
})
const isEditing = ref(!!props.postEdit)

// const editorToolbar = [
// 	['bold', 'italic', 'underline', 'strike'],
// 	['blockquote', 'code-block'],
// 	[{ 'header': 1 }, { 'header': 2 }],
// 	[{ 'list': 'ordered' }, { 'list': 'bullet' }],
// 	['link', 'image', 'video'],
// 	['clean']
// ]
const editorModules = [
	{
		module: ImageDrop,
		name: 'image-drop',
	}
]

const handleAttachFile = () => {
	console.log("attach file")
	fileInput.value.click();
}
const handleFileChange = (evt)  => {
	const files = evt.target.files;
	if (files.length > 0) {
		attachedFiles.value.push(files[0])
	}

}


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
		sala: paginaActual.value.id,
		autoriaGrupal: false,
	}
	// console.log("DATA", data)	
	let endpoint = '/api/entradas'
	if(isEditing.value){
		method = 'PATCH';
		endpoint = `/api/entradas/${props.postEdit.entrada.id}`
	}
	// Autoria grupal
	if(autorSeleccionado.value.id != authData.value.user.id){
		data.autoriaGrupal = true
		data.grupo = autorSeleccionado.value.id
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
const {docs:gruposDelUsuario} = await useApi(`/api/grupos?where[integrantes][contains]=${authData.value?.user?.id}`);
console.log(gruposDelUsuario)
const loadExistingContent = async () => {
	const { entrada, html } = props.postEdit
	myContent.value = html
	attachedImages.value = []
	attachedImages.value = entrada.imagenes.map(data => ({imagen: data.imagen.id}))
}

onMounted(() => {
	autoresOpciones.value.push({
		avatar: authData.value.user.avatar ? authData.value.user.avatar.sizes.thumbnail.url : null,
		name: authData.value?.user?.nombre, 
		id: authData.value?.user?.id 
	});
	gruposDelUsuario.forEach(grupo => {
		autoresOpciones.value.push({ 
			avatar: grupo.avatar ? grupo.avatar.sizes.thumbnail.url : null,
			name: grupo.nombre,
			id: grupo.id
		});
	});

	if(!autorSeleccionado.value && autoresOpciones.value.length > 0){
		autorSeleccionado.value = autoresOpciones.value[0];
	}

	if (isEditing.value) {
		loadExistingContent()
	}
	
    window.addEventListener('keydown', handleHotkey)
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleHotkey)
});

const handleHotkey = (e) => {
	if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
		e.preventDefault()
		console.log("Hotkey Publicar")
		Publicar();
	}
}
</script>
