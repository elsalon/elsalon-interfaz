import qs from 'qs';
export const useEntradaComentarios = (entrada) => {
    const fetchComentarios = async () => {
      entrada.comentarios.fetching = true;
      try {
        let query = {
          where: {
            and: [{ entrada: { equals: entrada.id } }]
          },
          sort: '-createdAt',
          limit: 3,
        };
  
        const oldestCommentDate = entrada.comentarios.docs.length > 0 
          ? entrada.comentarios.docs[0].createdAt 
          : null;
        
        if (oldestCommentDate) {
          query.where.and.push({ createdAt: { less_than: oldestCommentDate } });
        }
  
        const queryParams = qs.stringify(query, { encode: false });
        const res = await useAPI(`/api/comentarios?${queryParams}`);
  
        const comentariosNuevos = res.docs
          .filter(newComment => !entrada.comentarios.docs.some(existingComment => 
            existingComment.id === newComment.id))
          .reverse();
  
        entrada.comentarios.docs = [...comentariosNuevos, ...entrada.comentarios.docs];
        entrada.masComentarios = res.hasNextPage;
      } finally {
        entrada.comentarios.fetching = false;
      }
    };
  
    const fetchComentariosRecientes = async () => {
      if (entrada.comentarios.docs.length === 0) {
        return await fetchComentarios();
      }
  
      entrada.comentarios.fetching = true;
      try {
        const newestCommentDate = entrada.comentarios.docs[entrada.comentarios.docs.length - 1].createdAt;
        const query = {
          where: {
            and: [
              { entrada: { equals: entrada.id } },
              { createdAt: { greater_than: newestCommentDate } }
            ]
          },
          sort: 'createdAt',
        };
  
        const queryParams = qs.stringify(query, { encode: false });
        const res = await useAPI(`/api/comentarios?${queryParams}`);
  
        const comentariosNuevos = res.docs.filter(newComment => 
          !entrada.comentarios.docs.some(existingComment => existingComment.id === newComment.id));
        
        entrada.comentarios.docs = [...entrada.comentarios.docs, ...comentariosNuevos];
      } finally {
        entrada.comentarios.fetching = false;
      }
    };
  
    return {
      fetchComentarios,
      fetchComentariosRecientes
    };
  };