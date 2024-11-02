export default async () => {
    console.log("El salon middleware")
    const salonStore = useSalonStore()
    await salonStore.fetchConfig()
}