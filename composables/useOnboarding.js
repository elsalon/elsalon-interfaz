import Bienvenida from "~/components/onboarding/Bienvenida.vue";
import OnboardingGrupos from "~/components/onboarding/OnboardingGrupos.vue";

export const useOnboarding = () => {
    const onboardingManager = {
      "2025-01-01": [Bienvenida, OnboardingGrupos, Bienvenida],
    };
  
    const getPendingOnboardingSteps = (lastSeen) => {
      return Object.entries(onboardingManager)
        .filter(([date]) => new Date(date) > new Date(lastSeen))
        .flatMap(([, steps]) => steps);
    };
  
    return { onboardingManager, getPendingOnboardingSteps };
  };