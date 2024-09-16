<template>
    <ClientOnly fallback-tag="div" fallback="cargando editor...">
        <QuillEditor v-model:content="myContent" content-type="html" :toolbar="`#toolbar-${editorId}`" @ready="onEditorReady" class="quilleditor" @focus="focused" @blur="blured">
            <template #toolbar>
                <div class="toolbarContainer">
                    <div :id="`toolbar-${editorId}`" class="richTextToolbar">
                        <button class="ql-bold" v-tooltip.top="'Bold (ctrl+B)'"></button>
                        <button class="ql-italic"></button>
                        <!-- <button class="ql-underline mr-2"></button> -->
                        
                        <button class="ql-strike"></button>
                        <div style="width: 15px;"></div>
                        <button class="ql-blockquote"></button>
                        <button class="ql-code-block"></button>
                        <!-- <button class="ql-header" value="1"></button> -->
                        <!-- <button class="ql-list" value="ordered"></button> -->
                        <button class="ql-list" value="bullet"></button>
                        
                        <div style="width: 15px;"></div>
                        <button class="ql-link"></button>
                        <button class="ql-image"></button>
                        <button class="ql-video"></button>
                        <button class="ql-upload" v-tooltip.top="'Adjuntar Archivo'" @click="handleAttachFile"><i class="pi pi-file-arrow-up"></i></button>
                        <div style="width: 15px;"></div>
                        <button class="ql-clean"></button>
                    </div>
                </div>
            </template>

        </QuillEditor>
    </ClientOnly>
</template>
<script setup>
    import { QuillEditor } from '@vueup/vue-quill'
    import '@vueup/vue-quill/dist/vue-quill.snow.css';
    import Compressor from 'compressorjs';
    // Generate a unique ID for each editor instance
    const editorId = ref(`editor-${Math.random().toString(36).substring(2, 9)}`)
    const quill = ref(null)
    const myContent = ref('')
    const attachedImages = ref([])
    const attachedFiles = ref([])

    const emit = defineEmits(['publishHotKey'])
    const props = defineProps({
        editingData: { type: String, default: null }
    })
    // const isEditing = ref(!!props.postEdit)
    
    const handleAttachFile = () => {
        console.log('handleAttachFile')
    }

    const onEditorReady = (editor) => {
        // Referencia al editor
        quill.value = editor
        quill.value.getModule('toolbar').addHandler('ql-video', omegaHandlerFunction);
    }
    
    // HOTKEY Publicar con [ctrl + enter]
    const focused = () => {
        window.addEventListener('keydown', handlePublishHotkey)
    }
    const blured = () => {
        window.removeEventListener('keydown', handlePublishHotkey)
    }
    const handlePublishHotkey = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault()
            console.log("Hotkey Publicar comentario")
            emit('publishHotKey')
        }
    }

    const omegaHandlerFunction = () => {
        console.log('omegaHandlerFunction')
    }
    
    const parseEditorToUpload = async () => {
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

        // Ahora subo los attachments

        return {html, attachedImages: attachedImages.value}
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
        myContent.value = html
        attachedImages.value = []
        attachedImages.value = entrada.imagenes.map(data => ({imagen: data.imagen.id}))
    }

    onMounted(() => {
        if (props.editingData) {
            // isEditing.value = true
            // myContent.value = props.editingData
            parseExistingContent()
        }
    })

    const clear = () => {
        quill.value.root.innerHTML = ''
        attachedImages.value = []
    }
    // Expose the function so the parent can access it
    defineExpose({
        parseEditorToUpload,
        clear
    })
</script>
