<template>
    <ClientOnly fallback-tag="div" fallback="cargando editor...">
        <div ref="editorContainer" tabindex="0"></div>
        <div class="attachedFiled bg-white dark:bg-surface-800">
            <slot name="footerBeforeAttach"></slot>
            <div v-for="archivo in attachedFiles" class="text-sm bg-zinc-100 text-zinc-700 rounded-sm p-2 m-2 font-mono dark:bg-zinc-700 dark:text-zinc-200">
                <div class="flex items">
                    <div class="grow">
                        <i class="pi pi-paperclip mr-2"></i>
                        <span>{{ archivo.name }}</span>
                        <span> ({{ formatBytes(archivo.size) }})</span>
                    </div>
                    <button @click="attachedFiles.splice(attachedFiles.indexOf(f), 1)"
                    class="hover:text-zinc-800"><i class="pi pi-times"></i></button>
                </div>
            </div>
        </div>
        <input type="file" accept=".zip,.rar,.7zip,.pdf,.tar,.epub" ref="fileInput" style="display: none;"
        @change="handleFileChange" />
        <div id="dropzone" class="fixed w-full h-full top-0 left-0 pointer-events-none z-[999] bg-gray-300 opacity-0 transition-opacity duration-300 p-2 dark:bg-gray-800">
            <div class="flex items-center justify-center h-full border-4 border-dashed border-sky-400">
                <span class="text-2xl text-zinc-700 dark:text-zinc-200">Arrastrá y soltá imagenes o archivos</span>
            </div>
        </div>
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
const wordCount = ref(0)
const characterCount = ref(0)

const emit = defineEmits(['publishHotKey'])
const props = defineProps({
    editingData: { type: Object, default: null }
})

const urlRegex = /(https?:\/\/[^\s]+)/g;
const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:shorts\/|[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
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

const EditorIsEmpty = () => {
    let isEmpty = true
    // Any file 
    if (attachedFiles.value.length > 0) {
        isEmpty = false
    }
    // any text
    if (quill.getLength() > 1) {
        isEmpty = false
    }
    return isEmpty
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
    // Check if the file is a GIF; if so, skip compression to preserve animation
    let imageFile;
    if (file.type === 'image/gif') {
        imageFile = file; // Upload GIF as-is
    } else {
        imageFile = await CompressImage(file); // Compress other image types
    }
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


const isAcceptedFile = (file) => {
    const acceptedExtensions = ['.zip', '.rar', '.7zip', '.pdf', '.tar', '.epub'];
    return acceptedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
};

const insertImageFromFile = (file, range) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        const blob = file.getAsFile ? file.getAsFile() : file;
        reader.onload = (e) => {
            const base64ImageSrc = e.target.result;
            quill.insertEmbed(range.index, 'image', base64ImageSrc);
            quill.setSelection(range.index + 1);
            resolve();
        };
        reader.readAsDataURL(blob);
    });
};

const handleDroppedFile = async (file) => {
    if (file.type.startsWith('image/')) {
        const range = quill.getSelection() || { index: quill.getLength() };
        await insertImageFromFile(file, range);
    } else if (isAcceptedFile(file)) {
        attachedFiles.value.push(file);
    }else{
        toast.add({ severity: 'error', summary: 'Error', detail: `Tipo de archivo no soportado: ${file.name}`, life: 3000 });
    }
};

const parseExistingContent = () => {
    const { entrada, html } = props.editingData
    // console.log('parseExistingContent', entrada, html)
    quill.root.innerHTML = html
    attachedImages.value = entrada.imagenes?.map(data => ({ imagen: data.imagen.id })) || []
    attachedFiles.value = entrada.archivos?.map(data => ({ id: data.archivo.id, name: data.archivo.filename, size: data.archivo.filesize, uploaded: true })) || []
}
// Debounce utility function
function debounce(func, wait, immediate = false) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func.apply(context, args);
  };
}

// Your existing word counting function
function countMeaningfulWords(text) {
  if (!text || typeof text !== 'string') return 0;
  
  // Remove URLs
  let cleanText = text.replace(/https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g, '');
  
  // Remove HTML tags that might be part of pasted content
  cleanText = cleanText.replace(/<[^>]*>/g, '');
  
  // Remove email addresses
  cleanText = cleanText.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '');
  
  // Remove special characters and extra whitespace
  cleanText = cleanText.replace(/[^\w\s]|_/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Split by whitespace and count non-empty words
  const words = cleanText.split(' ').filter(word => {
    // Filter out common meaningless words like single letters (except 'a' and 'I')
    // if (word.length <= 1 && !['a', 'A', 'i', 'I'].includes(word)) {
    //   return false;
    // }
    
    // Filter out numbers by themselves
    if (/^\d+$/.test(word)) {
      return false;
    }
    
    return word.length > 0;
  });
  
  return {
    words: words.length,
    characters: cleanText.length
  }
}

// Create a debounced version of the word counter
const debouncedCountWords = debounce((text) => {
    const meaningfulWords = countMeaningfulWords(text);
  wordCount.value = meaningfulWords.words
  characterCount.value = meaningfulWords.characters
}, 200);


onMounted(async () => {
    if (import.meta.client) {

        const { default: Quill } = await import('quill')

        // Custom button definition
        const AttachButton = Quill.import('ui/icons')
        AttachButton['attach'] = '<i class="pi pi-file"></i>'

        quill = new Quill(editorContainer.value, {
            theme: 'snow',
            // placeholder: 'Escribe algo...',
            modules: {
                toolbar: {
                    container: [
                        [{ 'header': 1 }, 'bold', 'italic', 'underline', { 'align': [] }],
                        
                        // 'blockquote',
                        ['code-block', { 'list': 'bullet' }, 'link'],
                        // [{ 'header': 1 }, { 'header': 2 }],
                        ['image', 'video', 'attach', 'clean'],
                        // [{ 'script': 'sub' }, { 'script': 'super' }],
                        // [{ 'indent': '-1' }, { 'indent': '+1' }],
                        // [{ 'direction': 'rtl' }],
                        // [{ 'size': ['small', false, 'large', 'huge'] }],
                        // [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        // [{ 'color': [] }, { 'background': [] }],
                        // [{ 'font': [] }],
                        // ['clean'],
                        // ['image'],
                        // ['link'],
                    ],
                    handlers: {
                        attach: handleUploadFileClick
                    }
                },
                mention: {
                    allowedChars: /^[A-Za-z0-9\sáéíóúÁÉÍÓÚñÑüÜçÇàèìòùÀÈÌÒÙäëïöüÄËÏÖÜ\-]*$/,
                    mentionDenotationChars: ["@", "#"],
                    renderLoading: function () {
                        return 'Buscando usuarios o grupos...'
                    },
                    renderItem: function (item, searchTerm) {
                        console.log(item, searchTerm)
                        const div = document.createElement('div');
                        div.className = 'mention-item';

                        if(item.type === 'mention'){
                            // Si es mencion agregamos el avatar
                            if (item.avatar) {
                                // Puede ser imagen
                                const img = document.createElement('img');
                                img.src = item.avatar;
                                img.className = 'mention-avatar';
                                div.appendChild(img);
                            } else {
                                // O iniciales
                                const iniciales = document.createElement('div');
                                iniciales.className = 'mention-iniciales';
                                const inicialesTxt = item.value.split(' ').map(n => n[0]).join('').substring(0, 3).toUpperCase();
                                iniciales.innerText = inicialesTxt
                                div.appendChild(iniciales);
                            }
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
                            let search = searchTerm.trim()
                            search = search.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

                            console.log('search', search)
                            const [users, grupos] = await Promise.all([
                                useAPI(`/api/users?where[slug][like]=${search}&limit=5`),
                                useAPI(`/api/grupos?where[slug][like]=${search}&limit=5`)
                            ]);

                            values = [
                                ...users.docs.map(user => ({
                                    id: user.id,
                                    relationTo: 'users',
                                    value: user.nombre,
                                    avatar: user.avatar?.sizes.thumbnail.url,
                                    type: 'mention',
                                })),
                                ...grupos.docs.map(group => ({
                                    id: group.id,
                                    relationTo: 'grupos',
                                    value: group.nombre,
                                    avatar: group.avatar?.sizes.thumbnail.url,
                                    type: 'mention',
                                }))
                            ];
                        } else if (mentionChar === "#") {
                            const etiquetas = salonStore.etiquetas.filter(etiqueta =>
                                etiqueta.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
                            values = etiquetas.map(etiqueta => {
                                return { id: etiqueta.id, value: etiqueta.nombre, type: 'etiqueta' }
                            })
                        }

                        renderList(values, searchTerm);
                    },
                    dataAttributes: ['id', 'value', 'denotationChar', 'link', 'target', 'disabled', 'relationTo'],
                },
            }
        })

        // Handle agregar imagen (agregue permitir gif)
        const toolbar = quill.getModule('toolbar');
        toolbar.addHandler('image', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/jpg, image/jpeg, image/png, image/gif';
            input.click();
            input.onchange = async () => {
                const file = input.files[0];
                if (!file) return;
                const range = quill.getSelection() || { index: quill.getLength() };
                insertImageFromFile(file, range);
            }
        });

        // Disable quill default drag-and-drop behavior
        quill.root.addEventListener('drop', async (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        quill.root.addEventListener('dragover', async (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        let dragCounter = 0;

        document.addEventListener('dragenter', (e) => {
            dragCounter++;
            if (dragCounter === 1) {
                const dropzone = document.getElementById('dropzone');
                dropzone.classList.remove('opacity-0');
                dropzone.classList.add('opacity-80');
                dropzone.style.pointerEvents = 'auto';
            }
        });

        document.addEventListener('dragleave', (e) => {
            dragCounter--;
            if (dragCounter === 0) {
                const dropzone = document.getElementById('dropzone');
                dropzone.classList.remove('opacity-80');
                dropzone.classList.add('opacity-0');
                dropzone.style.pointerEvents = 'none';
            }
        });

        // Add custom drag-and-drop handlers for images
        const dropzone = document.getElementById('dropzone');
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault(); // Allow drop
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                handleDroppedFile(file).catch(console.error);
            }
            // Hide dropzone and reset counter after drop
            dropzone.classList.remove('opacity-80');
            dropzone.classList.add('opacity-0');
            dropzone.style.pointerEvents = 'none';
            dragCounter = 0;
        });

        // Limpiar formato de texto al pegar, manteniendo formato básico y convirtiendo encabezados a h1
        quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {

            delta.ops = delta.ops.map(op => {

            if (op.attributes) {
            const { bold, italic, underline, link, script, code, blockquote, list, header, align } = op.attributes;
            op.attributes = { bold, italic, underline, link, script, code, blockquote, list, align };
            if (header) {
            op.attributes.header = 1; // Convertir todos los encabezados a h1
            }
            }
            return {
            insert: op.insert,
            attributes: op.attributes
            }
            })
            return delta
        })
        quill.on('text-change', (delta, oldContents, source) => {
    const text = quill.getText();

    // Handle word counting
    if (delta.ops.some(op => op.insert && typeof op.insert === 'string' && op.insert.length > 30)) {
        const counts = countMeaningfulWords(text);
        wordCount.value = counts.words;
        characterCount.value = counts.characters;
    } else {
        debouncedCountWords(text);
    }

    // Only process user inputs (not programmatic changes)
    if (source !== 'user') return;

    // Check if the last operation includes typing a space or newline
    let lastOp = delta.ops[delta.ops.length - 1];
    const insertedSpace = lastOp && 
                        lastOp.insert && 
                        typeof lastOp.insert === 'string' && 
                        (lastOp.insert.includes(' ') || lastOp.insert.includes('\n'));
    
    if (!insertedSpace) return;
    
    // Get current selection
    const sel = quill.getSelection();
    if (!sel) return;
    
    // Get the current line
    const [currentLine, offset] = quill.getLine(sel.index);
    if (!currentLine) return;
    
    // Get the text of the current line
    const lineText = currentLine.text || '';
    
    // Find the last space before the current cursor position
    const lineIndex = quill.getIndex(currentLine);
    const cursorPosInLine = sel.index - lineIndex;
    
    // Get the last word (between the previous space and the current space)
    const textBeforeCursor = lineText.substring(0, cursorPosInLine);
    const words = textBeforeCursor.split(/\s+/);
    const lastWord = words[words.length - 2]; // -2 because -1 would be empty after the space
    
    if (!lastWord) return;
    
    // Check if the word is a URL
    const urlMatch = lastWord.match(urlRegex);
    if (!urlMatch) return;
    
    // Calculate the absolute position of the word in the document
    const lastWordPos = textBeforeCursor.lastIndexOf(lastWord);
    if (lastWordPos === -1) return;
    
    const absoluteStart = lineIndex + lastWordPos;
    const urlLength = lastWord.length;
    
    // Don't process if we're already inside a link
    const currentFormat = quill.getFormat(absoluteStart, urlLength);
    if (currentFormat.link) return;
    
    // Format as link
    console.log("Formatting URL:", lastWord, "at position:", absoluteStart, "length:", urlLength);
    quill.formatText(absoluteStart, urlLength, 'link', urlMatch[0]);
});

        // Add custom paste handler
        quill.root.addEventListener('paste', (event) => {
            // Get paste data
            const clipboardData = event.clipboardData || window.clipboardData;
            if (!clipboardData) return;
            
            const pastedText = clipboardData.getData('text');
            if (!pastedText) return;
            
            // Check if the pasted content is specifically a URL
            const youtubeMatch = pastedText.match(youtubeRegex);
            const vimeoMatch = pastedText.match(vimeoRegex);
            const urlMatch = pastedText.match(urlRegex);
            
            // Only interfere if it's a special URL type
            if (youtubeMatch || vimeoMatch || (urlMatch && urlMatch[0] === pastedText)) {
                // IMPORTANT: We need to stop the default behavior completely
                event.preventDefault();
                event.stopPropagation();
                
                const selection = quill.getSelection(true);
                if (!selection) return;
                
                if (youtubeMatch) {
                    const videoId = youtubeMatch[1];
                    // Use Quill's built-in video embed
                    quill.insertEmbed(selection.index, 'video', `https://www.youtube.com/embed/${videoId}`);
                    // Move cursor after insertion
                    quill.setSelection(selection.index + 1);
                } else if (vimeoMatch) {
                    const videoId = vimeoMatch[1];
                    quill.insertEmbed(selection.index, 'video', `https://player.vimeo.com/video/${videoId}`);
                    // Move cursor after insertion
                    quill.setSelection(selection.index + 1);
                } else if (urlMatch) {
                    // Insert the URL as a link only
                    quill.insertText(selection.index, pastedText, {'link': pastedText});
                    // Move cursor after insertion
                    quill.setSelection(selection.index + pastedText.length);
                }
            }
            // Let default paste handler work for non-URL content
        }, true); // <-- Add capture phase to ensure we're first

        editorContainer.value.firstChild.onfocus = () => {
            window.addEventListener('keydown', handlePublishHotkey)
        }
        editorContainer.value.firstChild.onblur = () => {
            window.removeEventListener('keydown', handlePublishHotkey)
        }
        
        quill.focus();
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
    wordCount,
    characterCount,
    EditorIsEmpty,
    parseEditorToUpload,
    clear
})
</script>

<style>
@import 'quill/dist/quill.core.css';
@import 'quill/dist/quill.snow.css';
</style>