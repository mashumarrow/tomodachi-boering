import { useMutation } from "@tanstack/react-query";
import { canUseGemini, estimateSymptomsWithGemini } from "@/api/gemini";
import { estimateSymptoms } from "@/lib/symptomEstimate";
import { simulateVisit } from "@/lib/simulation";
import { useBookingStore } from "@/store/bookingStore";

export function useSimulation() {
  const state = useBookingStore();
  const localSymptomEstimate = estimateSymptoms(state.symptoms);
  const geminiEstimateMutation = useMutation({
    mutationFn: () => estimateSymptomsWithGemini(state.symptoms),
    onSuccess: (estimate) => {
      state.setAiSymptomEstimate(estimate);
    }
  });
  const symptomEstimate = state.aiSymptomEstimate ?? localSymptomEstimate;
  const simulation = simulateVisit({
    hospital: state.hospital,
    origin: state.origin,
    transportMode: state.transportMode,
    availableMinutes: state.availableMinutes,
    needsPharmacy: state.needsPharmacy,
    symptomEstimate
  });

  return {
    ...state,
    symptomEstimate,
    symptomEstimateSource: state.aiSymptomEstimate ? "gemini" : "local",
    isEstimatingSymptoms: geminiEstimateMutation.isPending,
    symptomEstimateError: geminiEstimateMutation.error,
    canEstimateSymptomsWithAi: canUseGemini() && state.symptoms.trim().length >= 5,
    estimateSymptomsWithAi: geminiEstimateMutation.mutate,
    simulation
  };
}
