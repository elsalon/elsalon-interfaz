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
            const imgTag = `<img src="${image.imagen.sizes.medium.url}" data-salonid="${imageId}" />`
            content = content.replace(match[0], imgTag);
        }
    }

    // 2 y 3. Convierto menciones y etiquetas en HTML

    // Función auxiliar para convertir menciones o etiquetas
    const convertToHtml = (content, regex, entrada, array, type, urlPath, className) => {
        const matches = [...content.matchAll(regex)];

        for (const match of matches) {
            const fullText = match[0];       // El texto completo, e.g., [Coso gon](mencion:66dce3b5d0a303ddc377b366)
            const name = match[1];           // El 'name' dentro de los corchetes
            const dataId = match[2];         // El 'id' después de 'mencion:' o 'etiqueta:'
            
            // Encuentra el objeto basado en el id
            const item = entrada[array]?.find(obj => obj.id == dataId);
            if (!item) {
                continue; // Si no se encuentra el objeto, saltar esta iteración
            }

            // Crear la etiqueta <a> con el slug e id
            const link = `<a href="/${urlPath}/${item.slug}" class="${className}" data-value="${name}" data-id="${item.id}" contenteditable="false">${type === 'mencion' ? '@' : '#'}${name}</a>`;

            // Reemplazar la mención/etiqueta en el contenido
            content = content.replace(fullText, link);
        }

        return content;
    };

    // Expresiones regulares para menciones y etiquetas
    const mentionRegex = /\[([^\]]+)\]\(mencion:([a-zA-Z0-9]+)\)/g;
    const tagRegex = /\[([^\]]+)\]\(etiqueta:([a-zA-Z0-9]+)\)/g;

    // Convertir menciones
    content = convertToHtml(content, mentionRegex, entrada, 'mencionados', 'mencion', 'usuarios', 'mencion-link');

    // Convertir etiquetas
    content = convertToHtml(content, tagRegex, entrada, 'etiquetas', 'etiqueta', 'etiquetas', 'etiqueta-link');

    return content;
}