import { useRuntimeConfig } from '#app';

export default function useRenderSalonHtml(entrada){
    if(!entrada.imagenes){
        return entrada.contenido;
    }
    if(!entrada.contenido){
        return '';
    }
    const runtimeConfig = useRuntimeConfig().public;
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
    return content;
}