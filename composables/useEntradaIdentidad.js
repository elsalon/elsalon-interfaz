export const useEntradaIdentidad = (entrada, auth) => {
    const identidad = computed(() => {
      return entrada.autoriaGrupal ? entrada.grupo : entrada.autor;
    });
  
    const tituloIdentidad = computed(() => {
      return entrada.autoriaGrupal 
        ? entrada.grupo.integrantes.map(x => x.nombre).join(", ") 
        : entrada.autor.nombre;
    });
  
    const identidadUrl = computed(() => {
      return entrada.autoriaGrupal 
        ? `/grupos/${identidad.value.slug}` 
        : `/usuarios/${identidad.value.slug}`;
    });
  
    const UsuarioTieneAutoridad = entrada.autoriaGrupal
      ? entrada.grupo?.integrantes.some(i => i.id == auth.data.value.user.id)
      : entrada.autor.id == auth.data.value.user.id;
  
    const usuarioEsAdminODocente = auth.data.value.user.isAdmin || auth.data.value.user.rol == "docente";
  
    return {
      identidad,
      tituloIdentidad,
      identidadUrl,
      UsuarioTieneAutoridad,
      usuarioEsAdminODocente
    };
  };