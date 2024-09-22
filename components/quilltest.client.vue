<template>
    <client-only>
        <div ref="editorContainer"></div>
    </client-only>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
    value: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['update:value'])

const editorContainer = ref(null)
let quill = null

const AttachButtonHandler = () => {
    console.log('Custom button clicked!', quill.root.innerHTML)
    // Add your custom functionality here
}

import "quill-mention/autoregister";
import { ImageDrop } from 'quill-image-drop-module';

onMounted(async () => {
    if (process.client) {
        const { default: Quill } = await import('quill')

        Quill.register('modules/imageDrop', ImageDrop);
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
                        attach: AttachButtonHandler
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

        quill.root.innerHTML = props.value

        quill.on('text-change', () => {
            emit('update:value', quill.root.innerHTML)
        })
    }
})


onBeforeUnmount(() => {
    if (quill) {
        quill.off('text-change')
    }
})
</script>

<style>
@import 'quill/dist/quill.core.css';
@import 'quill/dist/quill.snow.css';
</style>