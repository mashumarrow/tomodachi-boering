import { estimateSymptoms } from "@/lib/symptomEstimate";
import { simulateVisit } from "@/lib/simulation";
import { useBookingStore } from "@/store/bookingStore";

export function useSimulation() {
  const state = useBookingStore();
  const symptomEstimate = estimateSymptoms(state.symptoms);
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
    simulation
  };
}
