import { useRuntimeConfig } from '#app';

export default function useRenderSalonHtml(entrada){
    
    if(!entrada.contenido){
        return '';
    }
    const runtimeConfig = useRuntimeConfig().public;
    // 1 Convierto los tags [image:id] en las imagenes reales
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

    // 2 Convierto menciones <span class="mention" en <a href="/perfil/username" usando el campo entrada.menciones
    const mentionRegex = /<span class="mention"[^>]*data-id="([^"]+)"[^>]*data-value="([^"]+)"[^>]*>(.*?)<\/span>/g;
    const mentionMatches = [...content.matchAll(mentionRegex)];
    console.log("****", mentionMatches)
    for (const match of mentionMatches) {
        const spanTag = match[0];
        const dataId = match[1];       // Extract the data-id
        const mentionValue = match[2]; // Extract the data-value (mention text)
        const usuario = entrada.mencionados?.find(usr => usr.id == dataId)
        if (!usuario) {
            continue;
        }
        
        // Create the <a> tag
        const mentionLink = `<a href="/usuarios/${usuario.slug}" class="mention-link">@${mentionValue}</a>`;
        
        // Replace the <span> tag with the <a> tag
        content = content.replace(spanTag, mentionLink);
    }

    // 3 Converit
    return content;
}