// composables/useScrollDirection.ts
export const useScrollDirection = (threshold = 50) => {
    const isHeaderVisible = ref(true);
    const lastScrollY = ref(0);
    const isLargeScreen = ref(false);
    
    const updateScreenSize = () => {
      // Consider 1024px (typical laptop width) as the breakpoint
      isLargeScreen.value = window.innerWidth >= 1024;
    }
    
    const handleScroll = () => {
      // Always show header on large screens regardless of scroll
      if (isLargeScreen.value) {
        isHeaderVisible.value = true;
        return;
      }
      
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
      updateScreenSize();
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', updateScreenSize);
    })
  
    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateScreenSize);
    })
  
    return {
      isHeaderVisible
    }
  }