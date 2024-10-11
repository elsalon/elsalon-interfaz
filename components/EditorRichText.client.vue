<template>
    <ClientOnly fallback-tag="div" fallback="cargando editor...">
        <div ref="editorContainer" tabindex="0"></div>
        <div class="attachedFiled">
            
            <div v-for="archivo in attachedFiles" class="text-sm bg-gray-100 text-gray-400 p-2 mb-1 font-mono">
                <div class="flex items">
                    <div class="grow">
                        <span>{{ archivo.name }}</span>
                        <span> ({{ formatBytes(archivo.size) }})</span>
                    </div>
                    <button @click="attachedFiles.splice(attachedFiles.indexOf(f), 1)" class="hover:text-gray-800">X</button>
                </div>
            </div>
        </div>
        <input type="file"  accept=".zip,.rar,.7zip,.pdf,.tar" ref="fileInput" style="display: none;" @change="handleFileChange" />
    </ClientOnly>
</template>

<script setup>
    // import { QuillEditor } from '@vueup/vue-quill'
    // import '@vueup/vue-quill/dist/vue-quill.snow.css';
    import "quill-mention/autoregister";

    import Compressor from 'compressorjs';
    import formatBytes from '~/composables/useBytesDisplay';
    // Generate a unique ID for each editor instance
    // const editorId = ref(`editor-${Math.random().toString(36).substring(2, 9)}`)
    const editorContainer = ref(null)
    let quill = null

    // const myContent = ref('')
    const attachedImages = ref([])
    const attachedFiles = ref([])
    const fileInput = ref(null)

    const emit = defineEmits(['publishHotKey'])
    const props = defineProps({
        editingData: { type: Object, default: null }
    })
    

    const handleUploadFileClick = () => {
        fileInput.value.click();
    }
    const handleFileChange = (e) => {
        const files = e.target.files;
        attachedFiles.value.push(files[0])
    }

    
    const handlePublishHotkey = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault()
            console.log("Hotkey Publicar comentario")
            emit('publishHotKey')
        }
    }
    
    const parseEditorToUpload = async () => {
        const delta = quill.getContents()
	    let html = quill.root.innerHTML
        
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

        // Ahora subo los attachments
        let archivos = []
        console.log("Subiendo archivos", attachedFiles.value)
        for (let file of attachedFiles.value) {
            if(file.uploaded) {
                console.log("Archivo ya subido", file)
                console.log("Archivo ya subido", {archivo: file.id})
                archivos.push({archivo: file.id})
                continue
            }
            const uploadedFile = await uploadFile(file)
            archivos.push({archivo: uploadedFile.id})
        }

        return {html, imagenes: attachedImages.value, archivos: archivos}
    }

    const uploadFile = async (file) => {
        const formData = new FormData()
        formData.append('file', file, file.name)
        try {
            const {doc} = await useUploadFile('/api/archivos', formData);
            console.log("Response:", doc)
            return { id: doc.id, url: doc.url }
        } catch (error) {
            console.error('Error uploading file:', error)
            // toast.add({ severity: 'error', summary: 'Error', detail: `No se puede subir el archivo ${file.name}`, life: 3000});
            return null
        }
    }

    const uploadImage = async (file) => {
        const formData = new FormData()
        const randFilename = useRandomFilenameBlob(file)
        const imageFile = await CompressImage(file)
        formData.append('file', imageFile, randFilename)
        try {
            const {doc} = await useUploadFile('/api/imagenes', formData);
            console.log("Response:", doc)
            return { id: doc.id, url: doc.url }
        } catch (error) {
            console.error('Error uploading image:', error)
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se puede subir esa imagen', life: 3000});
            return null
        }
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

    const parseExistingContent = () => {
        const { entrada, html } = props.editingData
        console.log('parseExistingContent', entrada, html)
        quill.root.innerHTML = html
        attachedImages.value = []
        attachedImages.value = entrada.imagenes.map(data => ({imagen: data.imagen.id}))
        // console.log('adjuntos', entrada.archivos)
        attachedFiles.value = []
        attachedFiles.value = entrada.archivos.map(data => ({id: data.archivo.id, name: data.archivo.filename, size: data.archivo.filesize, uploaded: true}))
    }

    onMounted(async () => {
        if (process.client) {

            const { default: Quill } = await import('quill')

            // Quill.register('modules/imageDrop', ImageDrop);
            // Custom button definition
            const AttachButton = Quill.import('ui/icons')
            AttachButton['attach'] = '<i class="pi pi-file"></i>'

            quill = new Quill(editorContainer.value, {
                theme: 'snow',
                modules: {
                    toolbar: {
                        container: [
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ 'align': [] }],
                            ['blockquote', 'code-block'],
                            // [{ 'header': 1 }, { 'header': 2 }],
                            [{ 'list': 'bullet' }],
                            ['link', 'image', 'video', 'attach'],
                            // [{ 'script': 'sub' }, { 'script': 'super' }],
                            // [{ 'indent': '-1' }, { 'indent': '+1' }],
                            // [{ 'direction': 'rtl' }],
                            // [{ 'size': ['small', false, 'large', 'huge'] }],
                            // [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                            // [{ 'color': [] }, { 'background': [] }],
                            // [{ 'font': [] }],
                            ['clean'],
                            // ['image'],
                            // ['link'],
                        ],
                        handlers: {
                            attach: handleUploadFileClick
                        }
                    },
                    mention: {
                        allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
                        mentionDenotationChars: ["@", "#"],
                        source: async function (searchTerm, renderList, mentionChar) {
                            let values = [];

                            if (mentionChar === "@") {
                                // values = [
                                //     { id: 1, value: 'Fredrik Sundqvist' },
                                //     { id: 2, value: 'Patrik Sjölin' }
                                // ];
                                if(searchTerm.length < 2) return
                                const response = await useApi(`/api/users?where[nombre][contains]=${searchTerm}&limit=5`, null, 'GET');
                                console.log(response.docs)
                                values = response.docs.map(user => {
                                    return { id: user.id, value: user.nombre }
                                })
                            } else {
                                values = [
                                    { id: 1, value: 'popular' },
                                    { id: 2, value: 'programming' },
                                    { id: 3, value: 'javascript' }
                                ];
                            }

                            if (searchTerm.length === 0) {
                                renderList(values, searchTerm);
                            } else {
                                const matches = values.filter(item =>
                                    item.value.toLowerCase().includes(searchTerm.toLowerCase())
                                );
                                renderList(matches, searchTerm);
                            }
                        },
                    },
                }
            })

            // quill.root.innerHTML = props.value

            quill.on('text-change', () => {
                // emit('update:value', quill.root.innerHTML)
            })

            editorContainer.value.firstChild.onfocus = () => {
                window.addEventListener('keydown', handlePublishHotkey)
            }
            editorContainer.value.firstChild.onblur = () => {
                window.removeEventListener('keydown', handlePublishHotkey)
            }
        }
        
        if (props.editingData) {
            // isEditing.value = true
            // myContent.value = props.editingData
            parseExistingContent()
        }        
    })

    onBeforeUnmount(() => {
        if (quill) {
            quill.off('text-change')
        }
    })

    const clear = () => {
        quill.root.innerHTML = ''
        attachedImages.value = []
        attachedFiles.value = []
    }
    // Expose the function so the parent can access it
    defineExpose({
        parseEditorToUpload,
        clear
    })
</script>

<style>
@import 'quill/dist/quill.core.css';
@import 'quill/dist/quill.snow.css';
</style>