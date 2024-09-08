<template>
    <ClientOnly fallback-tag="div" fallback="cargando editor">
        <QuillEditor v-model:content="myContent" :options="editorOptions" @ready="onEditorReady"/>
        <button @click="Publicar">Publicar</button>
    </ClientOnly>
</template>

<script setup>
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';

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
}

</script>