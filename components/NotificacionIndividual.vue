<template>
        <NuxtLink @click.prevent="handleClick()" :to="linkNotificacion" class="p-3 m-1 block" :class="{'bg-gray-100': !notificacion.leida}">
            <div class="flex notification-item">
                <div>
                    <AvatarSalon :usuario="props.notificacion.usuario" size="small" class="mr-4" />
                </div>
                <div>
                    <div class="text-sm mr-2" v-html="body"></div>

                    <div class="flex items-center justify-between">
                        <div class="text-gray-400 text-xs">{{ $formatDate(props.notificacion.createdAt) }}</div>
                    </div>
                </div>
            </div>
            
        </NuxtLink>
        <!-- <Button label="Marcar como leída" severity="warning" text aria-label="Marcar como leída"
            class="text-xs" @click.stop="MarcarLeida()" /> -->
</template>
<script setup>
const body = ref('')
const router = useRouter();
const linkNotificacion = ref('')

const { $formatDate } = useNuxtApp()
const props = defineProps({
    notificacion: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['leida'])

const handleClick = async () => {
    console.log('handleClick')
    await MarcarLeida()
    router.push(linkNotificacion.value);
}

const MarcarLeida = async () => {
    console.log('Marcar leida', props.notificacion.id)
    props.notificacion.leida = true
    const body = {leida:true}
    await useAPI(`/api/notificaciones/${props.notificacion.id}`, {body, method:'PATCH'})
    emit('leida', props.notificacion)
}

const DescEntradaOComentarioDelUsuario = async () => {
    switch(props.notificacion.sourceDocument.relationTo){
        case 'entradas':
            linkNotificacion.value = `/entradas/${props.notificacion.sourceDocument.value.id}`
            // La entrada puede ser propia o grupal
            if(props.notificacion.sourceDocument.value.autoriaGrupal){
                // Entrada grupal
                return `tu entrada grupal con ${props.notificacion.sourceDocument.value.grupo.nombre}: "${props.notificacion.sourceDocument.value.extracto}"`
            }else{
                // Entrada hecha por el usuario
                return `tu entrada "${props.notificacion.sourceDocument.value.extracto}"`
            }
        case 'comentarios':
            const entrada = await useAPI(`/api/entradas/${props.notificacion.sourceDocument.value.entrada}`)
            linkNotificacion.value = `/entradas/${entrada.id}`
            if(entrada.autoriaGrupal){
                // Entrada grupal
                return `tu entrada grupal con ${entrada.grupo.nombre}: "${entrada.extracto}"`
            }else{
                // Entrada hecha por el usuario
                return `tu entrada "${entrada.extracto}"` // referencia a la entrada de este comentario
            }
    }        
}

const DescEntradaOComentarioDesconocida = () => {
    linkNotificacion.value = `/entradas/${props.notificacion.sourceDocument.value.id}`
    switch(props.notificacion.sourceDocument.relationTo){
        case 'entradas':
            return `en una entrada "${props.notificacion.sourceDocument.value.extracto}"`
        case 'comentarios':
            return `en un comentario "${props.notificacion.sourceDocument.value.extracto}"`
    }        
}

body.value = `<strong>${props.notificacion.usuario?.nombre}</strong> `;

if(props.notificacion.cantidad > 0){
    body.value += `y ${props.notificacion.cantidad} más `
}

switch(props.notificacion.tipoNotificacion){
    case 'aprecio':
        body.value += `apreció ${await DescEntradaOComentarioDelUsuario()}`
        break;
    case 'comentario':
        body.value += `comentó ${await DescEntradaOComentarioDelUsuario()}`
        break;
    case 'comentario-grupal':
        body.value += `comentó como grupo <strong>${props.notificacion.sourceDocument.value.grupo.nombre}</strong>: "${props.notificacion.sourceDocument.value.extracto}"`
        break;
    case 'entrada-grupal':
        body.value += `publicó una entrada grupal con <strong>${props.notificacion.sourceDocument.value.grupo.nombre}</strong>: "${props.notificacion.sourceDocument.value.extracto}"`
        break;
    case 'mencion':
        body.value += `te mencionó ${DescEntradaOComentarioDesconocida()}`
        break;
    case 'colaboracion':
        body.value += `empezó a colaborar`;
        linkNotificacion.value = `/usuarios/${props.notificacion.usuario.slug}` // En este caso no linkeo a un contenido sino al usuario que inicio la interacción
        if(props.notificacion.sourceDocument.relationTo == 'users'){
            body.value += ` con vos`
        }else if(props.notificacion.sourceDocument.relationTo == 'grupos'){
            body.value += ` con tu grupo <strong>${props.notificacion.sourceDocument.value.nombre}</strong>`
        }
        break;
}

    
</script>