<template>
    <Dialog ref="onboardingDialog" @show="biggifyDialog" v-model:visible="showOnboarding" modal :closable="false" :draggable="false" class="">
        <div class="slider-container">
            <TransitionGroup name="slide" mode="out-in" tag="div" class="slider-grid">
            <div
                v-for="(step, index) in pendingSteps"
                :key="index"
                class="slide-item transition-transform duration-300"
                :class="{
                'translate-x-full': index > activeStep,
                '-translate-x-full': index < activeStep,
                'translate-x-0': index === activeStep
                }"
            >
                <component :is="step" />
            </div>
            </TransitionGroup>
        </div>

        <div class="relative min-w-80">
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
            <div v-if="pendingSteps.length > 1" class="flex justify-center space-x-1 absolute top-9 left-[50%] -translate-x-[50%]">
                <div v-for="(item, index) in pendingSteps" class="w-[4px] h-2 bg-gray-200 transition-all"
                    :class="{ '!bg-black !w-2': activeStep == index }"></div>
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
    const {getSession} = useAuth()
    showOnboarding.value = false;
    try{
        const data = {
            fechaOnboarding: new Date()
        }
        const userRes = await useAPI(`/api/users/${user.id}`, {body: data, method: 'PATCH'});
        console.log(userRes.message)
        await getSession()
    }catch(e){
        console.warn("No se pudo actualizar la fecha de onboarding")
    }
}

const onboardingDialog = ref()
function biggifyDialog() {
    if(window.innerWidth < 768){
        onboardingDialog.value.maximized = true;
    }
}

</script>


<style scoped>
.slider-container {
  width: 100%;
  overflow: hidden;
}

.slider-grid {
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 1fr;
}

.slide-item {
  grid-area: 1 / 1; /* All items placed in the same grid cell */
  width: 100%;
}
</style>