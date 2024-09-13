<template>
    <div class="group/entrada">
        <article>
            <!-- Para ocultar nombres hasta hover: opacity-0 group-hover:opacity-100 transition-opacity  -->
            <div class="flex items-center pb-2">
                <NuxtLink :to="identidadUrl">
                    <AvatarSalon :usuario="identidad" />
                </NuxtLink>
                
                <div class="ml-4">
                    <NuxtLink :to="identidadUrl">
                        <h2 class="font-bold text-gray-700">{{ identidad.nombre }}</h2>
                    </NuxtLink>
                    <div class="flex">
                        <a v-if="entrada.sala" class="text-sm mr-2" href="#">{{ entrada.sala.nombre }}</a>
                        <p class="text-gray-400 text-sm">{{ fechaFormateada }}</p>
                    </div>
                </div>
                <!-- Ajustes entrada -->
                <div class="flex-grow invisible group-hover/entrada:visible text-right">
                    <Button text @click="ToggleArticleOptions">...</Button>
                    <Menu :ref="el => menuRefs[entrada.id] = el" id="overlay_menu_article" :model="opcionesArticulo" :popup="true" class="text-xs" /> 
                </div>
            </div>
            <DeferredContent @load="onEntradaScrolled">
                <div class="prose prose-headings:my-1 sm:pl-[65px] leading-normal" v-html="contenidoRendereado"></div>
            </DeferredContent>

        </article>
        <div class="despues-entrada sm:pl-[65px]">
            <!-- <Divider /> -->
            <!-- Comentarios -->
             <div class="actions">
                <Button link class="my-2 text-xs text-surface-500" label="Comentar" @click="ToggleCommentBox"/>
                <Aprecio :entradaId="entrada.id"/>
             </div>
            <ListaComentarios :entradaId="entrada.id" :showCommentBox="showCommentBox" @userPosted="showCommentBox='0'"/>
        </div>
    </div>


</template>

<script setup>
const active = ref('0');
    import Menu from 'primevue/menu';
    const runtimeConfig = useRuntimeConfig().public;
    const { data } = useAuth()
    const props = defineProps({
        entrada: {
            type: Object,
            required: true,
        },
    });
    const { entrada } = props;
    const showCommentBox = ref('0');
    const ToggleCommentBox = () => {
        showCommentBox.value = showCommentBox.value == '0' ? '1' : '0';
        console.log('Toggle Comment Box', showCommentBox.value);
    }
    const datetime = new Date(entrada.createdAt);
    const fechaFormateada = datetime.toLocaleDateString('es-ES', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });

    const identidad = entrada.autoriaGrupal ? entrada.grupo : entrada.autor;
    const identidadUrl = entrada.autoriaGrupal ? `/grupos/${identidad.slug}` : `/usuarios/${identidad.slug}`;

    const opcionesArticulo = ref([
        {
            label: 'Copiar Link',
            command: () => {
                console.log('Copiar Link');
            }
        },
    ]);
    // Opciones si el usuario es el autor
    if(entrada.autor.id == data.value.user.id){
        opcionesArticulo.value = [
            ...opcionesArticulo.value,
            {
                label: 'Editar',
                command: () => {
                    console.log('Editar');
                    useNuxtApp().callHook("publicacion:editar", {entrada, html:contenidoRendereado.value})
                }
            },
            {
                label: 'Eliminar',
                command: () => {
                    console.log('Eliminar');
                }
            },
        ];
    }
    // Opciones si el usuario es admin
    if(data.value.user.isAdmin){
        opcionesArticulo.value = [
            ...opcionesArticulo.value,
            {
                label: 'Destacar',
                command: () => {
                    console.log('Destacar');
                }
            },
        ];
    }
    
    const menuRefs = ref({})
    const ToggleArticleOptions = (event) => {
        const menu = menuRefs.value[entrada.id]
        if (menu && menu.toggle) {
            menu.toggle(event)
        }
    };
    
    const contenidoRendereado = ref('')
    const renderContenido = async () => {
        if(!entrada.imagenes){
            contenidoRendereado.value = entrada.contenido
            return;
        }
        // Convierto los tags [image:id] en las imagenes reales
        let content = entrada.contenido
        const imageRegex = /\[image:([^\]]+)\]/g;
        const matches = [...content.matchAll(imageRegex)]
        
        for (const match of matches) {
            const tag = match[0]
            const imageId = match[1]
            // const imageId = match[1]
            const image = entrada.imagenes.find(img => img.imagen.id == imageId)
            if (image) {
                const imgTag = `<img src="${runtimeConfig.apiBase}${image.imagen.url}" data-salonid="${imageId}" />`
                content = content.replace(match[0], imgTag);
            }
        }
        
        contenidoRendereado.value = content
    }

    onMounted(() => {
        renderContenido();
    });

    const onEntradaScrolled = () => {
        // console.log('Entrada scrolled');
        // TODO fetch comentarios
        // TODO fetch aprecios
    }
</script>

<style>
img {
    max-width: 100%;
    height: auto;
    margin: 0 auto;
}
</style>