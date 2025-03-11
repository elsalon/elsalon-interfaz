import onboardingBienvenida from "~/components/onboarding/onboarding-bienvenida.vue";
import onboardingFeedCronologia from "~/components/onboarding/onboarding-feed-cronologia.vue";
import onboardingFeedSalas from "~/components/onboarding/onboarding-feed-salas.vue";
import onboardingFeedBitacora from "~/components/onboarding/onboarding-feed-bitacora.vue";
import onboardingGrupos from "~/components/onboarding/onboarding-grupos.vue";

export const useOnboarding = () => {
    const onboardingManager = {
      "2025-01-01": [onboardingBienvenida, onboardingFeedCronologia, onboardingFeedSalas, onboardingFeedBitacora, onboardingGrupos],
    };
  
    const getPendingOnboardingSteps = (lastSeen) => {
      return Object.entries(onboardingManager)
        .filter(([date]) => new Date(date) > new Date(lastSeen))
        .flatMap(([, steps]) => steps);
    };
  
    return { onboardingManager, getPendingOnboardingSteps };
  };