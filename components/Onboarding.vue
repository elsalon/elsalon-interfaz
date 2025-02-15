<template>
    <Dialog v-model:visible="showOnboarding" modal :closable="false" >
        
        <div class="overflow-hidden ">
            <div class="relative min-h-40 overflow-hidden">
                <!-- Ensure this container is relative and has a fixed height -->
                <TransitionGroup name="slide" mode="out-in">
                    <div v-for="(step, index) in pendingSteps" :key="index"
                        class="absolute top-0 left-0 w-full h-full transition-transform duration-300" :class="{
                            'translate-x-full': index > activeStep,
                            '-translate-x-full': index < activeStep,
                            'translate-x-0': index === activeStep
                        }">
                        <component :is="step" />
                    </div>
                </TransitionGroup>
            </div>
        </div>

        <div class="relative min-w-64">
            <!-- BOTONES -->
            <div class="flex pt-6 justify-end space">
                <Button v-if="activeStep > 0" severity="secondary" icon="pi pi-arrow-left" size="small"
                    @click="activeStep--" />
                <Button v-if="activeStep < pendingSteps.length - 1" icon="pi pi-arrow-right" size="small"
                    iconPos="right" @click="activeStep++" />
                <Button v-if="activeStep == pendingSteps.length - 1" icon="pi pi-check" size="small" iconPos="right"
                    @click="completeOnboarding()" />
            </div>
            <!-- PUNTITOS -->
            <div class="flex justify-center space-x-1 absolute top-9 left-[50%] -translate-x-[50%]">
                <div v-for="(item, index) in pendingSteps" class="w-2 h-2 rounded-full bg-gray-200"
                    :class="{ 'bg-gray-400': activeStep == index }"></div>
            </div>
        </div>

    </Dialog>
</template>

<script setup>
const { getPendingOnboardingSteps } = useOnboarding();
const user = useAuth().data.value.user;
const pendingSteps = getPendingOnboardingSteps(user.fechaOnboarding);
console.log("fechaOnboarding:", user.fechaOnboarding, "Pending steps:", pendingSteps.length)
const activeStep = ref(0);
const showOnboarding = ref(pendingSteps.length > 0)

const completeOnboarding = async() => {
    showOnboarding.value = false;
    try{
        const data = {
            fechaOnboarding: new Date()
        }
        const userRes = await useAPI(`/api/users/${user.id}`, {body: data, method: 'PATCH'});
        console.log(userRes.message)
    }catch(e){
        console.warn("No se pudo actualizar la fecha de onboarding")
    }
}

</script>
