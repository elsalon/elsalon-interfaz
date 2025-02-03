// composables/useReactiveAuth.js
export function useReactiveAuth() {
    const authData = ref(null)
    const myKey = ref(0);
    const { data, status } = useAuthState()

    watch([data, status], ([newData, newStatus]) => {
        myKey.value++
        authData.value = newData?.user
    }, { immediate: true, deep: true })

    return { authData, status, myKey }
}