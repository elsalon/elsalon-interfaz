<template>
    <Dialog v-model:visible="showOnboarding" modal :closable="closable" header=" ">
        <Stepper v-model:value="activeStep" style="min-width:40rem">
            <StepPanels>
            <StepPanel v-for="(item, i) in pendingSteps" :value="i">
                <component :is="pendingSteps[i]" />
            </StepPanel>
            <!-- <StepPanels>
                <StepPanel :value="0">
                    <div class="flex flex-col h-48">
                        <div
                            class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded bg-surface-50 dark:bg-surface-950 flex-auto flex justify-center items-center font-medium">
                            Content I</div>
                    </div>
                </StepPanel>
                <StepPanel :value="1">
                    <div class="flex flex-col h-48">
                        <div
                            class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded bg-surface-50 dark:bg-surface-950 flex-auto flex justify-center items-center font-medium">
                            Content II</div>
                    </div>
                </StepPanel>
                <StepPanel :value="2">
                    <div class="flex flex-col h-48">
                        <div
                            class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded bg-surface-50 dark:bg-surface-950 flex-auto flex justify-center items-center font-medium">
                            Content III</div>
                    </div>
                </StepPanel> -->
            </StepPanels>

            <div class="relative">
                <!-- BOTONES -->
                <div class="flex pt-6 justify-end space">
                    <Button v-if="activeStep > 0"  severity="secondary" icon="pi pi-arrow-left" size="small"
                    @click="activeStep--" />
                    <Button v-if="activeStep < pendingSteps.length-1"  icon="pi pi-arrow-right" size="small"
                    iconPos="right" @click="activeStep++" />
                    <Button v-if="activeStep == pendingSteps.length-1"  icon="pi pi-check" size="small"
                    iconPos="right" @click="showOnboarding = false" />
                </div>
                <!-- PUNTITOS -->
                <div class="flex justify-center space-x-1 absolute top-9 left-[50%] -translate-x-[50%]">
                    <div v-for="(item,i) in pendingSteps" class="w-2 h-2 rounded-full bg-gray-200" :class="{'bg-gray-400': activeStep == i}" ></div>
                </div>

            </div>
        </Stepper>
        
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
const closable = computed(() => {
    return true;
})

</script>