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
                    <button @click="attachedFiles.splice(attachedFiles.indexOf(f), 1)"
                        class="hover:text-gray-800">X</button>
                </div>
            </div>
        </div>
        <input type="file" accept=".zip,.rar,.7zip,.pdf,.tar" ref="fileInput" style="display: none;"
            @change="handleFileChange" />
    </ClientOnly>
</template>

<script setup>
import "quill-mention/autoregister";
const salonStore = useSalonStore();

import Compressor from 'compressorjs';
import formatBytes from '~/composables/useBytesDisplay';
// Generate a unique ID for each editor instance
// const editorId = ref(`editor-${Math.random().toString(36).substring(2, 9)}`)
const editorContainer = ref(null)
let quill = null;
const toast = useToast();

// const myContent = ref('')
const attachedImages = ref([])
const attachedFiles = ref([])
const fileInput = ref(null)

const emit = defineEmits(['publishHotKey'])
const props = defineProps({
    editingData: { type: Object, default: null }
})

const urlRegex = /\bhttps?:\/\/[^\s<]+(?![^<]*<\/a>)/;
const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
const vimeoRegex = /(?:https?:\/\/)?(?:www\.|player\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|video\/|)(\d+)(?:[a-zA-Z0-9_-]+)?/i;


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

const parseEditorToUpload = async (btnLabel = null) => {
    const delta = quill.getContents()
    let html = quill.root.innerHTML

    var embedsYoutube = [];
    var embedsVimeo = [];
    // Procesar imagenes
    // Busco todos los blobs de imagenes y las subo
    // Los convierto a formato [image:id] para que el backend lo entienda
    // Si payload cambia la url de la imagen no se pierde la imagen en el contenido
    // Tambien guardo referencia a todas las imagenes del posteo en attachedImages
    for (let op of delta.ops) {
        if (op.insert && op.insert.video) {
            // Guardo array de ids videos
            const link = op.insert.video;
            const youtubeMatch = link.match(youtubeRegex);
            const vimeoMatch = link.match(vimeoRegex);

            // If a YouTube URL is matched
            if (youtubeMatch) {
                const videoId = youtubeMatch[1];
                embedsYoutube.push(videoId);
            }
            if (vimeoMatch) {
                const videoId = vimeoMatch[1];
                embedsVimeo.push(videoId);
            }
        }
        if (op.insert && op.insert.image) {
            const imageUrl = op.insert.image
            if (imageUrl.startsWith('data:')) {
                console.log(op)
                // This is a base64 image, need to upload
                const file = await fetch(imageUrl).then(res => res.blob())
                btnLabel.value = "Subiendo imágenes..."
                const uploadedImage = await uploadImage(file)
                if (uploadedImage) {
                    html = html.replace(imageUrl, `[image:${uploadedImage.id}]`)
                    console.log("Pushing image", uploadedImage.id)
                    attachedImages.value.push({ imagen: uploadedImage.id })
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
        if (file.uploaded) {
            console.log("Archivo ya subido", file)
            console.log("Archivo ya subido", { archivo: file.id })
            archivos.push({ archivo: file.id })
            continue
        }
        btnLabel.value = "Subiendo Archivos..."
        const uploadedFile = await uploadFile(file)
        archivos.push({ archivo: uploadedFile.id })
    }

    btnLabel.value = "Procesando..."
    // Parse menciones y etiquetas
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    let mencionados = [];
    let etiquetas = [];

    // Función auxiliar para procesar tanto menciones como etiquetas
    const processElements = (elements, type) => {
        return [...elements].map(el => {
            const dataId = el.getAttribute('data-id');
            const dataValue = el.getAttribute('data-value');
            // Crear el texto de reemplazo basado en el tipo
            if (type == 'mencion') {
                if (el.getAttribute('data-relation-to') == 'users') {
                    type = 'usuario';
                } else if (el.getAttribute('data-relation-to') == 'grupos') {
                    type = 'grupo';
                }
            }
            const replacementText = `[${dataValue}](${type}:${dataId})`;
            el.outerHTML = replacementText; // Reemplazar con el formato personalizado
            return { value: dataId, relationTo: el.getAttribute('data-relation-to') }; // Devolver el ID para agregarlo al array correspondiente
        });
    };

    // Procesar nuevas y viejas menciones
    mencionados.push(
        ...processElements(tempDiv.querySelectorAll('span.mention[data-denotation-char="@"]'), "mencion"),
        ...processElements(tempDiv.querySelectorAll('.mencion-link'), "mencion")
    );

    // Procesar nuevas y viejas etiquetas
    etiquetas.push(
        ...processElements(tempDiv.querySelectorAll('span.mention[data-denotation-char="#"]'), "etiqueta"),
        ...processElements(tempDiv.querySelectorAll('.etiqueta-link'), "etiqueta")
    );

    html = tempDiv.innerHTML;
    console.log("mencionados", mencionados, "etiquetas", etiquetas)

    embedsYoutube = embedsYoutube.join(",");
    embedsVimeo = embedsVimeo.join(",");

    btnLabel.value = "Publicando..."
    return { html, imagenes: attachedImages.value, archivos, mencionados, etiquetas, embedsYoutube, embedsVimeo }
}

const uploadFile = async (file) => {
    const formData = new FormData()
    formData.append('file', file, file.name)
    try {
        const { doc } = await useUploadFile('/api/archivos', formData);
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
        const { doc } = await useUploadFile('/api/imagenes', formData);
        return { id: doc.id, url: doc.url }
    } catch (error) {
        console.error('Error uploading image:', error)
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se puede subir esa imagen', life: 3000 });
        return null
    }
}

const CompressImage = async (blob) => {
    console.log("Compressing image")
    return new Promise((resolve, reject) => {
        new Compressor(blob, {
            quality: 0.7,
            maxWidth: 2160,
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
    // console.log('parseExistingContent', entrada, html)
    quill.root.innerHTML = html
    attachedImages.value = []
    attachedImages.value = entrada.imagenes.map(data => ({ imagen: data.imagen.id }))
    // console.log('adjuntos', entrada.archivos)
    attachedFiles.value = []
    attachedFiles.value = entrada.archivos.map(data => ({ id: data.archivo.id, name: data.archivo.filename, size: data.archivo.filesize, uploaded: true }))
}

onMounted(async () => {
    if (process.client) {

        const { default: Quill } = await import('quill')

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
                        // 'blockquote',
                        ['code-block'],
                        [{ 'list': 'bullet' }],
                        // [{ 'header': 1 }, { 'header': 2 }],
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
                    renderLoading: function () {
                        return 'Buscando usuarios o grupos...'
                    },
                    renderItem: function (item, searchTerm) {
                        console.log(item, searchTerm)
                        const div = document.createElement('div');
                        div.className = 'mention-item';

                        if (item.avatar) {
                            const img = document.createElement('img');
                            img.src = item.avatar;
                            img.className = 'mention-avatar';
                            div.appendChild(img);
                        } else {
                            const iniciales = document.createElement('div');
                            iniciales.className = 'mention-iniciales';
                            const inicialesTxt = item.value.split(' ').map(n => n[0]).join('').substring(0, 3).toUpperCase();
                            iniciales.innerText = inicialesTxt
                            div.appendChild(iniciales);
                        }

                        div.appendChild(document.createTextNode(item.value));

                        return div;
                        // return Node.createElement('div', {class: 'mention-item'}, item.value)
                        // return `<div class="mention-item">${item.value}</div>`
                    },
                    source: async function (searchTerm, renderList, mentionChar) {
                        let values = [];

                        if (mentionChar === "@") {
                            if (searchTerm.length < 2) return
                            const search = searchTerm.trim()
                            console.log('search', search)
                            const [users, grupos] = await Promise.all([
                                useAPI(`/api/users?where[nombre][like]=${search}&limit=5`),
                                useAPI(`/api/grupos?where[nombre][like]=${search}&limit=5`)
                            ]);

                            values = [
                                ...users.docs.map(user => ({
                                    id: user.id,
                                    relationTo: 'users',
                                    value: user.nombre,
                                    avatar: user.avatar?.sizes.thumbnail.url
                                })),
                                ...grupos.docs.map(group => ({
                                    id: group.id,
                                    relationTo: 'grupos',
                                    value: group.nombre,
                                    avatar: group.avatar?.sizes.thumbnail.url
                                }))
                            ];
                        } else if (mentionChar === "#") {
                            const etiquetas = salonStore.etiquetas.filter(etiqueta =>
                                etiqueta.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
                            values = etiquetas.map(etiqueta => {
                                return { id: etiqueta.id, value: etiqueta.nombre }
                            })
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
                    dataAttributes: ['id', 'value', 'denotationChar', 'link', 'target', 'disabled', 'relationTo'],
                },
            }
        })

        // Limpiar formato de texto al pegar
        quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
            console.log("Clean clipboard")
            delta.ops = delta.ops.map(op => {
                return {
                    insert: op.insert
                }
            })
            return delta
        })

        quill.on('text-change', (delta) => {
            const ops = delta.ops;

            // Check if the delta has relevant operations
            if (!ops || ops.length < 1 || ops.length > 2) {
                return;
            }

            const lastOp = ops[ops.length - 1];

            // Check if the last operation is a string insert and if it includes whitespace
            if (!lastOp.insert || typeof lastOp.insert !== 'string' || !lastOp.insert.match(/\s/)) {
                return;
            }

            // Get the selection and current leaf node
            const sel = quill.getSelection();
            if (!sel) {
                return;
            }

            const [leaf] = quill.getLeaf(sel.index);
            const leafIndex = quill.getIndex(leaf);

            if (!leaf.text) {
                return;
            }

            // Determine the relevant text length until the cursor position
            const relevantLength = sel.index - leafIndex;
            const text = leaf.text.slice(0, relevantLength);

            // Only proceed if the text is not part of a link
            if (leaf.parent.domNode.localName === 'a') {
                return;
            }

            // Check if we are at the end of the text and whether it ends with whitespace
            const nextLetter = leaf.text[relevantLength];
            if (nextLetter != null && nextLetter.match(/\S/)) {
                return;
            }

            const urlMatch = text.match(urlRegex);
            const youtubeMatch = text.match(youtubeRegex);
            const vimeoMatch = text.match(vimeoRegex);

            // If a URL is matched
            if (urlMatch) {
                console.log('URL:', urlMatch[0]);
                const url = urlMatch[0];
                const link = `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
                quill.deleteText(leafIndex, relevantLength); // Remove the original text
                quill.clipboard.dangerouslyPasteHTML(leafIndex, link); // Insert the link
            }

            // If a YouTube URL is matched
            if (youtubeMatch) {
                console.log('YouTube:', youtubeMatch[1])
                const videoId = youtubeMatch[1];
                const iframe = `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
                quill.deleteText(leafIndex, relevantLength); // Remove the original text
                quill.clipboard.dangerouslyPasteHTML(leafIndex, iframe); // Insert the iframe
            }

            // If a Vimeo URL is matched
            if (vimeoMatch) {
                const videoId = vimeoMatch[1];
                const iframe = `<iframe src="https://player.vimeo.com/video/${videoId}" frameborder="0" allowfullscreen></iframe>`;
                quill.deleteText(leafIndex, relevantLength); // Remove the original text
                quill.clipboard.dangerouslyPasteHTML(leafIndex, iframe); // Insert the iframe
            }
        });

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