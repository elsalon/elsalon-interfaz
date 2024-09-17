<template>
    <div class="group/entrada">
        <article :key="reloadkey">
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
                        <NuxtLink v-if="entrada.sala" class="text-sm mr-2" :to="`/salones/${entrada.sala.slug}`">{{ entrada.sala.nombre }}</NuxtLink>
                        <p class="text-gray-400 text-sm">{{ $formatDate(entrada.createdAt) }}</p>
                    </div>
                </div>
                <!-- Ajustes entrada -->
                <div class="flex-grow invisible group-hover/entrada:visible text-right">
                    <Button text @click="ToggleArticleOptions">...</Button>
                    <Menu :ref="el => menuRefs[entrada.id] = el" id="overlay_menu_article" :model="opcionesArticulo" :popup="true" class="text-xs" /> 
                </div>
            </div>
            <DeferredContent>
                <div class="prose prose-headings:my-1 sm:pl-[65px] leading-normal" v-html="contenidoRendereado"></div>
                <div class="sm:pl-[65px]" v-if="archivos.length"><ListaArchivos :archivos="archivos"/></div>
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
    import useRenderSalonHtml from '~/composables/useRenderSalonHtml';
    const { hooks } = useNuxtApp();
    const toast = useToast();
    const { data : authData} = useAuth()
    const props = defineProps({
        entrada: {
            type: Object,
            required: true,
        },
    });
    const reloadkey = ref(0);
    const { entrada } = props;
    const emit = defineEmits(['eliminar']);
    const showCommentBox = ref('0');
    const ToggleCommentBox = () => {
        showCommentBox.value = showCommentBox.value == '0' ? '1' : '0';
    }
    
    const { $formatDate } = useNuxtApp()

    const identidad = ref();
    const identidadUrl = ref();
    const DefinirIdentidad = (doc = entrada) => {
        identidad.value = doc.autoriaGrupal ? doc.grupo : doc.autor;
        identidadUrl.value = doc.autoriaGrupal ? `/grupos/${identidad.value.slug}` : `/usuarios/${identidad.value.slug}`;
    }
    DefinirIdentidad();

    const opcionesArticulo = ref([
        {
            label: 'Copiar Link',
            command: () => {
                const url = `${window.location.origin}/entradas/${entrada.id}`;
                navigator.clipboard.writeText(url);
                toast.add({ severity: 'contrast', detail: 'Link copiado', life: 3000});
            }
        },
    ]);
    // Opciones si el usuario es el autor
    if(entrada.autor.id == authData.value.user.id){
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
                    EliminarEntrada();
                }
            },
        ];
    }
    // Opciones si el usuario es admin
    if(authData.value.user.isAdmin){
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
    const archivos = ref(entrada.archivos)
    
    const EliminarEntrada = async () => {
        console.log('Eliminar entrada');
        try{
            const response = await useApi(`/api/entradas/${entrada.id}`, {}, 'DELETE');
            console.log("Entrada eliminada:", response)
            emit('eliminar');
            toast.add({ severity: 'contrast', detail: 'Entrada eliminada', life: 3000});
        }catch(e){
            console.warn(e);
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la entrada', life: 3000});
        }
    }

    let removeOnEditHook = null;

    const handlePublicacionEditada = async (data) => {
        if(data.resultado == "ok" && data.entrada.id == entrada.id){
            entrada.value = data.entrada
            contenidoRendereado.value = await useRenderSalonHtml(data.entrada);
            archivos.value = data.entrada.archivos
            console.log("autoriaGrupal",entrada.autoriaGrupal, data.entrada.autoriaGrupal)
            DefinirIdentidad(data.entrada)
            reloadkey.value++
        }
            // // Publicacion exitosa. Cierro el dialogo y muestro un toast
            // toast.add({ severity: 'contrast', detail: 'Entrada editada', life: 3000});   
            // contenidoRendereado.value = data.html
        // console.log('User edited', data)
        // entrada.contenido = data.html
        // contenidoRendereado.value = data.html
    }

    onMounted(async () => {
        contenidoRendereado.value = await useRenderSalonHtml(entrada);
        removeOnEditHook = hooks.hook('publicacion:editada', handlePublicacionEditada)
    });
    onUnmounted(() => {
        if(removeOnEditHook) removeOnEditHook()
    })

</script>

<style>
img {
    max-width: 100%;
    height: auto;
    margin: 0 auto;
}
</style>