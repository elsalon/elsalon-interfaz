// composables/useScrollDirection.ts
export const useScrollDirection = (threshold = 50) => {
    const isHeaderVisible = ref(true);
    const lastScrollY = ref(0);
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDifference = currentScrollY - lastScrollY.value
      
      // Only trigger hide/show after passing threshold
      if (Math.abs(scrollDifference) > threshold) {
        // Scrolling down and past threshold
        if (currentScrollY > lastScrollY.value) {
          isHeaderVisible.value = false
        } 
        // Scrolling up
        else {
          isHeaderVisible.value = true
        }
        lastScrollY.value = currentScrollY
      }
    }
  
    onMounted(() => {
      window.addEventListener('scroll', handleScroll)
    })
  
    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
    })
  
    return {
      isHeaderVisible
    }
  }