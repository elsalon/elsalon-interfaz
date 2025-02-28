export const useGenerateSalaUrl = () => {
    const GenerateSalaUrl = (slug) => {
      if (slug === 'el-salon') {
        return '/';
      }
      return `/salas/${slug}`;
    }
    
    return {
        GenerateSalaUrl
    }
  }