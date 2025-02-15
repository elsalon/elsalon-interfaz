<template>
    <Dialog v-model:visible="showOnboarding" modal :closable="false">
        <!-- {{ activeStep }} {{ pendingSteps }} -->


        <div class="overflow-hidden min-w-[40rem]">

            <div class="relative w-full min-h-40 overflow-hidden"> <!-- Ensure this container is relative and has a fixed height -->
    <TransitionGroup name="slide" mode="out-in">
        <div v-for="(step, index) in pendingSteps" :key="index"
            class="absolute top-0 left-0 w-full h-full transition-transform duration-300"
            :class="{
                'translate-x-full': index > activeStep,
                '-translate-x-full': index < activeStep,
                'translate-x-0': index === activeStep
            }">
            <component :is="step"/>
        </div>
    </TransitionGroup>
</div>

        </div>

        <div class="relative">
            <!-- BOTONES -->
            <div class="flex pt-6 justify-end space">
                <Button v-if="activeStep > 0" severity="secondary" icon="pi pi-arrow-left" size="small"
                    @click="activeStep--" />
                <Button v-if="activeStep < pendingSteps.length - 1" icon="pi pi-arrow-right" size="small"
                    iconPos="right" @click="activeStep++" />
                <Button v-if="activeStep == pendingSteps.length - 1" icon="pi pi-check" size="small" iconPos="right"
                    @click="showOnboarding = false" />
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
console.log(user.fechaOnboarding)
const pendingSteps = getPendingOnboardingSteps(user.fechaOnboarding);
console.log(pendingSteps)


const activeStep = ref(0);
const SetStep = (i) => activeStep.value = i
const showOnboarding = ref(pendingSteps.length > 0)

const steps = [
    defineComponent({ template: '<div class="h-64 bg-red-200 flex items-center justify-center">Step 1</div>' }),
    defineComponent({ template: '<div class="h-64 bg-green-200 flex items-center justify-center">Step 2</div>' }),
    defineComponent({ template: '<div class="h-64 bg-blue-200 flex items-center justify-center">Step 3</div>' })
]

const visible = (index) => { console.log(index); return index == activeStep.value }

const next = () => {
    if (activeStep.value < steps.length - 1) {
        activeStep.value++
    }
}

const prev = () => {
    if (activeStep.value > 0) {
        activeStep.value--
    }
}

</script>
