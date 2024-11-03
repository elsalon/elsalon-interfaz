export default async () => {
    const salonStore = useSalonStore()
    await salonStore.fetchConfig()
}