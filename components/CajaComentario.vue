<template>
    <ClientOnly fallback-tag="div" fallback="cargando editor">
        <div>
            <!-- Editor -->
            <div class="comment-input relative border border-surface-0 border-solid p-2" :class="{'border-surface-200' : mostrarExtras}">
                <div v-if="!userEdited" class="absolute left-8 top-5 text-sm text-surface-300">Comentar</div>
                <QuillEditor v-model:content="myComment" content-type="html" :modules="editorModules" :toolbar="editorToolbar" theme="bubble" @ready="onEditorReady" @focus="focused" @blur="blured"/>
            </div>
            <div class="text-right mt-2" :style="{ visibility: userEdited ? 'visible' : 'hidden' }">
                <Button  @click="Publicar" :loading="uploading" size="small">Comentar</Button>
            </div>
        </div>
    </ClientOnly>
</template>

<script setup>
import { ImageDrop } from 'quill-image-drop-module';
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.bubble.css';

const myComment = ref('')
const mostrarExtras = ref(false)

const editorToolbar = [
	['bold', 'italic', 'underline', 'strike'],
	['blockquote', 'code-block'],
	['link', 'image', 'video'],
	['clean']
]
const editorModules = [
	{
		module: ImageDrop,
		name: 'image-drop',
	}
]

const focused = () => {
    mostrarExtras.value = true
}
const blured = () => {
    mostrarExtras.value = false
}
const userEdited = computed(() => {
    return myComment.value !== ''
})

const onEditorReady = () => {
    console.log('Editor ready')
}
</script>