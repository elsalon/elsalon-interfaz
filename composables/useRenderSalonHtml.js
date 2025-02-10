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
    // Expresiones regulares para menciones y etiquetas
    const mentionUsuarioRegex = /\[([^\]]+)\]\(usuario:([a-zA-Z0-9]+)\)/g;
    const mentionGrupoRegex = /\[([^\]]+)\]\(grupo:([a-zA-Z0-9]+)\)/g;
    const tagRegex = /\[([^\]]+)\]\(etiqueta:([a-zA-Z0-9]+)\)/g;

    // Función auxiliar para convertir menciones o etiquetas
    const parseEtiquetasToHtml = (content, entrada,  className) => {
        const matches = [...content.matchAll(tagRegex)];

        for (const match of matches) {
            const fullText = match[0];       // El texto completo, e.g., [Coso gon](mencion:66dce3b5d0a303ddc377b366)
            const name = match[1];           // El 'name' dentro de los corchetes
            const dataId = match[2];         // El 'id' después de 'mencion:' o 'etiqueta:'
            
            // Encuentra el objeto basado en el id
            const item = entrada.etiquetas?.find(obj => obj.id == dataId);
            if (!item) {
                continue; // Si no se encuentra el objeto, saltar esta iteración
            }

            // Crear la etiqueta <a> con el slug e id
            const link = `<a href="/etiquetas/${item.slug}" class="'etiqueta-link'" data-value="${name}" data-id="${item.id}" contenteditable="false">#${name}</a>`;

            // Reemplazar la mención/etiqueta en el contenido
            content = content.replace(fullText, link);
        }

        return content;
    };

    
    const parseMencionesToHtml = (content, regex, entrada) => {
        const matches = [...content.matchAll(regex)];

        for (const match of matches) {
            const fullText = match[0];       // El texto completo, e.g., [Coso gon](mencion:66dce3b5d0a303ddc377b366)
            const name = match[1];           // El 'name' dentro de los corchetes
            const dataId = match[2];         // El 'id' después de 'mencion:' o 'etiqueta:'
            
            // Encuentra el objeto basado en el id
            const item = entrada.mencionados?.find(obj => obj.value.id == dataId);
            if (!item) {
                continue; // Si no se encuentra el objeto, saltar esta iteración
            }
            const urlPath = item.relationTo === 'users' ? 'usuarios' : 'grupos';
            // Crear la etiqueta <a> con el slug e id
            const link = `<a href="/${urlPath}/${item.value.slug}" class="mencion-link" data-value="${name}" data-id="${item.value.id}" data-relation-to="${item.relationTo}" contenteditable="false">@${name}</a>`;

            // Reemplazar la mención/etiqueta en el contenido
            content = content.replace(fullText, link);
        }

        return content;
    };
    // Convertir menciones usuarios
    content = parseMencionesToHtml(content, mentionUsuarioRegex, entrada);

    // Convertir menciones grupos
    content = parseMencionesToHtml(content, mentionGrupoRegex, entrada);

    // Convertir etiquetas
    content = parseEtiquetasToHtml(content, entrada);

    return content;
}