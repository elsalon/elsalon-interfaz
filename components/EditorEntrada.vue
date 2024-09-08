<template>
    <ClientOnly fallback-tag="div" fallback="Loading editor...">
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

    const response = await useApi('api/entradas', {contenido: html});
    console.log('Content submitted successfully:', response)
//     try {
//         const runtimeConfig = useRuntimeConfig().public
//         // const response = await fetch(runtimeConfig.apiBase + runtimeConfig.entradasApi, {
//         //     method: 'POST',
//         //     headers: {
//         //     'Content-Type': 'application/json',
//         // },
//         // const { data } = await useCustomFetch<[]>(runtimeConfig.apiBase + runtimeConfig.entradasApi)
//         const body = JSON.stringify({
//             contenido: html,
//             // attachedImages: attachedImages.value,
//             // Add other fields as required by your PayloadCMS schema
//         })
//         const { token  } = useAuth();
//         const response = await $fetch( runtimeConfig.apiBase + runtimeConfig.entradasApi, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': token.value
//             },
//             body
//         } );
    
//     console.log('Content submitted successfully:', response)
//   } catch (error) {
//     console.error('Error submitting content:', error)
//   }
}

</script>