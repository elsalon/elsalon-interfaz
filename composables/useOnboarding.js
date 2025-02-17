import onboardingBienvenida from "~/components/onboarding/onboarding-bienvenida.vue";
import onboardingFeedElsalon from "~/components/onboarding/onboarding-feed-elsalon.vue";
import onboardingFeedSalones from "~/components/onboarding/onboarding-feed-salones.vue";
import onboardingFeedBitacora from "~/components/onboarding/onboarding-feed-bitacora.vue";
import onboardingGrupos from "~/components/onboarding/onboarding-grupos.vue";

export const useOnboarding = () => {
    const onboardingManager = {
      "2025-01-01": [onboardingBienvenida, onboardingFeedElsalon, onboardingFeedSalones, onboardingFeedBitacora, onboardingGrupos],
    };
  
    const getPendingOnboardingSteps = (lastSeen) => {
      return Object.entries(onboardingManager)
        .filter(([date]) => new Date(date) > new Date(lastSeen))
        .flatMap(([, steps]) => steps);
    };
  
    return { onboardingManager, getPendingOnboardingSteps };
  };