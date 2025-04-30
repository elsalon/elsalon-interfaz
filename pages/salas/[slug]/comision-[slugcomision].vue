<template>
    <NuxtLayout name="layout-contenido">
        <template #header>
            <RouterLink :to="`/`" class="link">S</RouterLink> /
            <NuxtLink :to="`/salas/${salon.slug}`" class="link">{{ salon.siglas }}</NuxtLink> /
            {{ comision.nombre }}
        </template>
        

        <div class="text-center mb-2">
            <LogoSala :salon="salon"/>
            <NuxtLink class="text-3xl font-bold" :to="`/salas/${salon.slug}`"><h1>{{ salon.nombre }}</h1></NuxtLink>
            
            <h2 class="text-xl font-bold">
                <CajaNombreComision :comision="comision"/>
            </h2>
            <!-- <h2 class="text-xl font-bold"></h2> -->
                 
            <BtnListaComisiones :salon="salon" :periodo="periodo" />
            <BtnListaArchivo v-if="salon.archivo.activar" :salon="salon" />
        </div>
        
        <!-- Docentes A Cargo y Alumnos -->
        <div class="text-center flex justify-evenly items-center gap-x-2 w-full mb-2 bg-white p-1">
            <div class="flex flex-wrap gap-1 items-center self-center">
                <!-- Docentes -->
                <NuxtLink v-for="docente in comision.docentes" class="h-6" :key="docente.id" :to="`/usuarios/${docente.slug}`" v-tooltip.top="docente.nombre">
                    <AvatarSalon :usuario="docente" size="small" imagesize="small" />
                </NuxtLink>
                <!-- Alumnxs -->
                <NuxtLink v-for="integrante in comision.integrantes" class="h-6" :key="integrante.id" :to="`/usuarios/${integrante.slug}`" v-tooltip.top="integrante.nombre">
                    <AvatarSalon :usuario="integrante" size="small" imagesize="small" />
                </NuxtLink>
                <!-- Grupos -->
                <NuxtLink v-for="grupo in comision.grupos" class="h-6" :key="grupo.id" :to="`/grupos/${grupo.slug}`" v-tooltip.top="grupo.nombre">
                    <AvatarSalon :usuario="grupo" size="small" imagesize="small" />
                </NuxtLink>

                <!-- Boton agregar integrantes -->
                <Button v-if="puedeAgregarIntegrantes" class="h-6 w-6" severity="secondary" icon="pi pi-plus" iconPos="left"  v-tooltip.top="'Agregar integrantes'" @click="agregarIntegrantesVisible = true"/>
            </div>
            
            <!-- Btn Abandonar -->
            <BtnUnirmeComision :comision="comision" @UsuarioCambioInscripcion="RecargarComision" :key="unirmeKey"/>
            
            <!-- Btn tooltip info comision -->
             <div class="w-6 h-6" tabindex="1" v-tooltip.top.focus="'Las comisiones funcionan como un filtro, reuniendo en un solo lugar las entradas y bitácoras de sus integrantes y grupos, sin ser un espacio de publicación directa.'">
                <i class="pi pi-question-circle text-zinc-600 hover:text-zinc-900"></i>
             </div>
        </div>

        <!-- Modal agregar integrantes -->
        <Dialog v-model:visible="agregarIntegrantesVisible" modal header="Agregar integrantes" style="min-width: 35vw;">
            <form @submit.prevent="handleSubmitAgregarIntegrantes" class="space-y-3">
                <SelectorUsuarios v-model="nuevosIntegrantes" />
                <div class="text-right mb-10">
                    <Button type="submit" class="" label="Agregar" iconPos="right" :loading="loading" />
                </div>

            </form>
        </Dialog>

        <!-- Lista entradas comision -->
        <ListaEntradas :apiUrl="`/api/comisiones/${comision.id}/feed`" :query="query" :key="unirmeKey" :cacheKey="cacheKey"/>
    </NuxtLayout>
</template>

<script setup>
const toast = useToast();
const auth = useAuth();
const puedeAgregarIntegrantes = auth.data.value.user.rol == 'docente' || auth.data.value.user.isAdmin
const agregarIntegrantesVisible = ref(false)
const nuevosIntegrantes = ref([]);
const loading = ref(false)

const route = useRoute()
const slug = route.params?.slug
const salonStore = useSalonStore();
const salon = ref(null)
salon.value = salonStore.salas.find(salon => salon.slug === slug)
const slugComision = route.params?.slugcomision
const res = await useAPI(`/api/comisiones?where[or][0][and][0][slug][equals]=${slugComision}`);
const comision = ref(res.docs[0])
const unirmeKey = ref(0)
salonStore.setContext('salon', salon.value.id)
salonStore.SetPageTitle(`Comisión ${comision.value.nombre}`)
const RecargarComision = async () => {
    const res = await useAPI(`/api/comisiones?where[or][0][and][0][slug][equals]=${slugComision}`);
    comision.value = res.docs[0]
    unirmeKey.value++;
}


// Filtro por el periodo actual
let query = {}
const periodo = salon.value.archivo.periodos[0]
const cacheKey = `comision-${salon.value.id}-${periodo.slug}`
if(salon.value.archivo.activar){
    query = {
        where: {
            and: [
                { createdAt: { greater_than_equal: periodo.startDate } },
                { createdAt: { less_than_equal: periodo.endDate } }
            ]
        }
    }
}


const handleSubmitAgregarIntegrantes = async () => {
    loading.value = true
    let integrantes = comision.value.integrantes?.map(integrante => integrante.id) || []
    
    let nuevosIntegrantesIds = nuevosIntegrantes.value.map(integrante => integrante.id)
    let listaIntegrantes = [...new Set([...integrantes, ...nuevosIntegrantesIds])]
    try{
        const res = await useAPI(`/api/comisiones/${comision.value.id}`, {
            method: 'PATCH',
            body: { integrantes: listaIntegrantes }
        })
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Integrantes agregados correctamente',  life: 3000 });
        RecargarComision()
        agregarIntegrantesVisible.value = false
        nuevosIntegrantes.value = []
    }catch(e){
        console.error('Error al agregar integrantes', e)
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al agregar integrantes', life: 3000 });
    }finally{
        loading.value = false
    }
}
</script>