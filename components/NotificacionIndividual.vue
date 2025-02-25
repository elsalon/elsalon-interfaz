<template>
    <NuxtLink @click.prevent="HandleNotificacionLink()" :to="linkNotificacion" class="p-3 mb-1 block"
        :class="{ 'bg-zinc-200': !notificacion.leida }">
        <div class="flex notification-item">
            <div>
                <AvatarSalon :usuario="props.notificacion.identidad.value" size="small" class="mr-4" style="font-size: .6rem;" 
                :avatarType="props.notificacion.identidad.relationTo"/>
            </div>
            <div>
                <div class="text-sm mr-2" v-html="props.notificacion.mensaje"></div>

                <div class="flex items-center justify-between">
                    <div class="text-zinc-600 text-xs">
                        <time :datetime="props.notificacion.createdAt">{{ $formatDate(props.notificacion.createdAt) }}</time>
                    </div>
                </div>
            </div>
        </div>

    </NuxtLink>
    <!-- <Button label="Marcar como leída" severity="warning" text aria-label="Marcar como leída"
            class="text-xs" @click.stop="MarcarLeida()" /> -->
</template>

<script setup>
const router = useRouter();
const linkNotificacion = ref('')
const notificacionesStore = useNotificacionesStore()

const { $formatDate } = useNuxtApp()
const props = defineProps({
    notificacion: {
        type: Object,
        required: true
    }
})


// const identidad = ref()
const emit = defineEmits(['leida'])

// Hardcodeo link de notificacion rol docente
if(props.notificacion.categoria === 'rol-docente'){
    linkNotificacion.value = "/nodo/docente"
}else{
    // Sino lo asigno normalmente segun linkNotificacion
    switch (props.notificacion.link.relationTo) {
        case 'entradas':
            linkNotificacion.value = `/entradas/${props.notificacion.link.value.id}`
            break;
        case 'users':
            linkNotificacion.value = `/usuarios/${props.notificacion.link.value.slug}`
            break;
        case 'grupos':
            linkNotificacion.value = `/grupos/${props.notificacion.link.value.slug}`
            break;
        case 'salones':
            linkNotificacion.value = `/salones/${props.notificacion.link.value.slug}`
            break;
    }
}

const HandleNotificacionLink = async () => {
    console.log('HandleNotificacionLink')
    await MarcarLeida();
    notificacionesStore.dialogVisible = false
    router.push(linkNotificacion.value)
}

const MarcarLeida = async () => {
    console.log('Marcar leida', props.notificacion.id)
    props.notificacion.leida = true
    const body = { leida: true }
    await useAPI(`/api/notificaciones/${props.notificacion.id}`, { body, method: 'PATCH' })
    emit('leida', props.notificacion)
}

// const DescComentario = async () => {
//     switch(props.notificacion.sourceDocument.relationTo){
//         case 'entradas':
//             linkNotificacion.value = `/entradas/${props.notificacion.sourceDocument.value.id}`
//             // La entrada puede ser propia o grupal
//             if(props.notificacion.sourceDocument.value.autoriaGrupal){
//                 // Entrada grupal
//                 return `tu entrada grupal con <strong>${props.notificacion.sourceDocument.value.grupo.nombre}</strong>: "${props.notificacion.sourceDocument.value.extracto}"`
//             }else{
//                 // Entrada hecha por el usuario
//                 return `tu entrada "${props.notificacion.sourceDocument.value.extracto}"`
//             }
//         case 'comentarios':
//             const entrada = await useAPI(`/api/entradas/${props.notificacion.sourceDocument.value.entrada}`)
//             linkNotificacion.value = `/entradas/${entrada.id}`
//             if(entrada.autoriaGrupal){
//                 // Entrada grupal
//                 return `tu comentario grupal con <strong>${entrada.grupo.nombre}</strong>: "${entrada.extracto}"`
//             }else{
//                 // Entrada hecha por el usuario
//                 return `tu comentario "${entrada.extracto}"` // referencia a la entrada de este comentario
//             }
//     }        
// }

// const DescAprecio = async () => {
//     switch(props.notificacion.sourceDocument.relationTo){
//         case 'entradas':
//             linkNotificacion.value = `/entradas/${props.notificacion.sourceDocument.value.id}`
//             return `en una entrada "${props.notificacion.sourceDocument.value.extracto}"`
//         case 'comentarios':
//             linkNotificacion.value = `/entradas/${props.notificacion.sourceDocument.value.entrada}`
//             console.log("**",props.notificacion.sourceDocument.value.entrada)
//             // if (entrada.autoriaGrupal) {
//             //     // Entrada grupal
//             //     return `tu comentario grupal con <strong>${entrada.grupo.nombre}</strong>: "${entrada.extracto}"`
//             // } else {
//             //     // Entrada hecha por el usuario
//             //     return `tu comentario "${entrada.extracto}"` // referencia a la entrada de este comentario
//             // }
//     }        
// }

// const DescEntradaOComentarioDesconocida = () => {
//     linkNotificacion.value = `/entradas/${props.notificacion.sourceDocument.value.id}`
//     switch(props.notificacion.sourceDocument.relationTo){
//         case 'entradas':
//             return `en una entrada "${props.notificacion.sourceDocument.value.extracto}"`
//         case 'comentarios':
//             return `en un comentario "${props.notificacion.sourceDocument.value.extracto}"`
//     }        
// }

// identidad.value = props.notificacion.usuario; // default

// switch(props.notificacion.tipoNotificacion){
//     case 'aprecio':
//         body.value = `<strong>${props.notificacion.usuario?.nombre}</strong> `;
//         if(props.notificacion.cantidad > 0){
//             body.value += `y ${props.notificacion.cantidad} más `
//         }
//         body.value += `apreció ${await DescAprecio()}`
//         break;
//     case 'comentario':
//         body.value = `<strong>${props.notificacion.usuario?.nombre}</strong> `;
//         // body.value += `comentó ${await DescComentario()}`
//         break;
//     case 'comentario-grupal':
//         body.value = `<strong>${props.notificacion.usuario?.nombre}</strong> `;
//         body.value += `comentó como grupo <strong>${props.notificacion.sourceDocument.value.grupo.nombre}</strong>: "${props.notificacion.sourceDocument.value.extracto}"`
//         break;
//     case 'entrada-grupal':
//         body.value = `<strong>${props.notificacion.usuario?.nombre}</strong> `;
//         body.value += `publicó una entrada grupal con <strong>${props.notificacion.sourceDocument.value.grupo.nombre}</strong>: "${props.notificacion.sourceDocument.value.extracto}"`
//         break;
//     case 'mencion':
//         body.value = `<strong>${props.notificacion.usuario?.nombre}</strong> `;
//         body.value += `te mencionó ${DescEntradaOComentarioDesconocida()}`
//         break;
//     case 'enlace':
//         body.value = `<strong>${props.notificacion.usuario?.nombre}</strong> `;
//         body.value += `se enlazó`;
//         linkNotificacion.value = `/usuarios/${props.notificacion.usuario.slug}` // En este caso no linkeo a un contenido sino al usuario que inicio la interacción
//         if(props.notificacion.sourceDocument.relationTo == 'users'){
//             body.value += ` con vos`
//         }else if(props.notificacion.sourceDocument.relationTo == 'grupos'){
//             body.value += ` con tu grupo <strong>${props.notificacion.sourceDocument.value.nombre}</strong>`
//         }
//         break;

//     case 'grupo-fuiste-agregado':
//         identidad.value = props.notificacion.sourceDocument.value; // El grupo
//         body.value = `fuiste agregado al grupo <strong>${props.notificacion.sourceDocument.value.nombre}</strong>`
//         linkNotificacion.value = `/grupos/${props.notificacion.sourceDocument.value.id}`
//         break;
//     case 'grupo-integrante-nuevo':
//         identidad.value = props.notificacion.sourceDocument.value; // El grupo
//         body.value = `<strong>${props.notificacion.usuario?.nombre}</strong> `;
//         body.value += `fue agregado al grupo <strong>${props.notificacion.sourceDocument.value.nombre}</strong>`
//         linkNotificacion.value = `/grupos/${props.notificacion.sourceDocument.value.id}`
//         break;
//     case 'grupo-integrante-abandono':
//         identidad.value = props.notificacion.sourceDocument.value; // El grupo
//         body.value = `<strong>${props.notificacion.usuario?.nombre}</strong> `;
//         body.value += `abandonó el grupo <strong>${props.notificacion.sourceDocument.value.nombre}</strong>`
//         linkNotificacion.value = `/grupos/${props.notificacion.sourceDocument.value.id}`
//         break;

//     default:
//         props.notificacion.usuario
//         identidad.value = props.notificacion.usuario
//         body.value = `Tipo de notificación desconocido`
//         break;
// }




</script>